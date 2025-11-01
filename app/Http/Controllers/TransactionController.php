<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Daftar obat yang masih tersedia (sum qty dari batches non-expired)
     * plus tanggal kadaluarsa terdekat (untuk ditampilkan di UI).
     */
    public function index()
    {
        $today = now()->toDateString();

        $medicines = Medicine::query()
            // total qty tersedia (hanya batch yang belum expired)
            ->withSum(['batches as available_qty' => function ($q) use ($today) {
                $q->where('expiration_date', '>', $today);
            }], 'qty')
            // tanggal expired terdekat untuk informasi di UI
            ->withMin(['batches as nearest_expiration' => function ($q) use ($today) {
                $q->where('expiration_date', '>', $today);
            }], 'expiration_date')
            ->having('available_qty', '>', 0)
            ->get()
            ->map(function ($m) {
                return [
                    'id'                 => $m->id,
                    'name'               => $m->name,
                    'price'              => (float) $m->price,
                    'available_qty'      => (int) ($m->available_qty ?? 0),
                    'category'           => $m->category,
                    'unit'               => $m->unit,
                    'nearest_expiration' => $m->nearest_expiration, // YYYY-MM-DD
                ];
            });

        return Inertia::render('Transactions', [
            'medicines' => $medicines,
        ]);
    }

    /**
     * Simpan transaksi dengan pengurangan stok FEFO dari medicine_batches.
     * Catatan:
     * - Transaksi ini langsung "complete" dan stok dikurangi di sini.
     * - Jika mau pakai status "pending" dulu, pindahkan blok FEFO ke updateStatus()
     *   saat status berubah dari pending -> complete.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer.name'      => 'nullable|string|max:255',
            'customer.phone'     => 'nullable|string|max:20',
            'discount.type'      => 'required|in:none,percentage,fixed',
            'discount.value'     => 'required|numeric|min:0',
            'items'              => 'required|array|min:1',
            'items.*.id'         => 'required|exists:medicines,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $today = now()->toDateString();

                // 1) Hitung subtotal & validasi ketersediaan (total across batches non-expired)
                $subtotal = 0;
                $normalizedItems = [];

                foreach ($validated['items'] as $it) {
                    $medicine = Medicine::findOrFail($it['id']);
                    $qtyRequested = (int) $it['quantity'];

                    $available = MedicineBatch::where('medicine_id', $medicine->id)
                        ->where('expiration_date', '>', $today)
                        ->sum('qty');

                    if ($available < $qtyRequested) {
                        return back()->withErrors([
                            'message' => "Stok tidak cukup untuk {$medicine->name}. Tersedia: {$available}"
                        ]);
                    }

                    $itemTotal  = (float) $medicine->price * $qtyRequested;
                    $subtotal  += $itemTotal;

                    $normalizedItems[] = [
                        'medicine'  => $medicine,
                        'quantity'  => $qtyRequested,
                        'price'     => (float) $medicine->price,
                    ];
                }

                // 2) Hitung diskon & total bayar
                $discountValue = 0.0;
                if ($validated['discount']['type'] === 'percentage') {
                    $discountValue = ($subtotal * $validated['discount']['value']) / 100;
                } elseif ($validated['discount']['type'] === 'fixed') {
                    $discountValue = min((float) $validated['discount']['value'], $subtotal);
                }
                $total = round($subtotal - $discountValue, 2);

                // 3) Buat transaksi
                $trxCode = 'TRX-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
                $transaction = Transaction::create([
                    'transaction_code' => $trxCode,
                    'customer_name'    => $validated['customer']['name']  ?? null,
                    'customer_phone'   => $validated['customer']['phone'] ?? null,
                    'discount_type'    => $validated['discount']['type'],
                    'discount_value'   => $discountValue,
                    'subtotal'         => $subtotal,
                    'total'            => $total,
                    'user_id'          => Auth::id(),
                    'type'             => 'cashier',
                    'status'           => 'complete', // stok akan dikurangi sekarang
                ]);

                // 4) FEFO: kurangi stok dari batches yang paling cepat expired
                foreach ($normalizedItems as $row) {
                    $medicine = $row['medicine'];
                    $qtyToTake = $row['quantity'];

                    // buat item agregat per medicine
                    $trxItem = TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'medicine_id'    => $medicine->id,
                        'quantity'       => $qtyToTake,
                        'price'          => $row['price'],
                    ]);

                    // kunci batch agar aman dari race condition
                    $batches = MedicineBatch::where('medicine_id', $medicine->id)
                        ->where('expiration_date', '>', $today)
                        ->orderBy('expiration_date', 'asc')
                        ->orderBy('id', 'asc')
                        ->lockForUpdate()
                        ->get();

                    foreach ($batches as $batch) {
                        if ($qtyToTake <= 0) break;

                        $take = min($batch->qty, $qtyToTake);
                        if ($take <= 0) continue;

                        // kurangi qty batch
                        $batch->decrement('qty', $take);

                        // (Opsional) simpan jejak batch di pivot:
                        // TransactionItemBatch::create([
                        //     'transaction_item_id' => $trxItem->id,
                        //     'medicine_batch_id'   => $batch->id,
                        //     'quantity'            => $take,
                        // ]);

                        $qtyToTake -= $take;
                    }

                    if ($qtyToTake > 0) {
                        // Secara logika tidak akan terjadi karena sudah divalidasi sum() di atas.
                        throw new \RuntimeException("Stok batch tidak mencukupi untuk {$medicine->name}.");
                    }
                }

                // 5) Muat relasi untuk struk
                $transaction->load(['items.medicine', 'user']);

                return redirect()->back()->with([
                    'success'     => 'Transaction completed successfully!',
                    'transaction' => [
                        'id'       => $transaction->transaction_code,
                        'date'     => $transaction->created_at->format('Y-m-d H:i:s'),
                        'customer' => [
                            'name'  => $transaction->customer_name,
                            'phone' => $transaction->customer_phone,
                        ],
                        'items' => $transaction->items->map(function ($it) {
                            return [
                                'name'     => $it->medicine->name,
                                'quantity' => $it->quantity,
                                'price'    => (float) $it->price,
                            ];
                        }),
                        'subtotal' => (float) $transaction->subtotal,
                        'discount' => (float) $transaction->discount_value,
                        'total'    => (float) $transaction->total,
                        'cashier'  => $transaction->user->name,
                    ]
                ]);
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Update status transaksi.
     * Penting: JANGAN kurangi stok lagi di sini (agar tidak double-decrement).
     * Jika ingin pola "pending dulu, stok berkurang saat complete", pindahkan
     * blok FEFO dari store() ke sini, hanya saat status berubah ke 'complete'.
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,complete',
        ]);

        DB::transaction(function () use ($validated, $transaction) {
            // Jika butuh logika "pending -> complete baru kurangi stok",
            // cek status lama & baru di sini, lalu jalankan loop FEFO seperti di store().
            $transaction->update(['status' => $validated['status']]);
        });

        return response()->json([
            'success'     => true,
            'message'     => 'Transaction status updated successfully.',
            'transaction' => [
                'id'     => $transaction->id,
                'status' => $transaction->status,
            ],
        ]);
    }

    public function history(Request $request)
    {
        $query = Transaction::with(['user', 'items.medicine']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhereHas('items.medicine', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('date_range') && $request->date_range !== 'all') {
            $today = now();
            switch ($request->date_range) {
                case 'today':
                    $query->whereDate('created_at', $today->toDateString());
                    break;
                case 'yesterday':
                    $query->whereDate('created_at', $today->copy()->subDay()->toDateString());
                    break;
                case '7days':
                    $query->where('created_at', '>=', $today->copy()->subDays(7));
                    break;
                case '30days':
                    $query->where('created_at', '>=', $today->copy()->subDays(30));
                    break;
            }
        }

        if ($request->has('cashier') && $request->cashier !== 'all') {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', $request->cashier);
            });
        }

        $transactions = $query->latest()->paginate(20);

        return Inertia::render('TransactionHistory', [
            'transactions' => $transactions,
            'filters'      => $request->only(['search', 'date_range', 'cashier'])
        ]);
    }
}
