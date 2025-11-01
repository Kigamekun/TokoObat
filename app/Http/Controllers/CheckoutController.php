<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'        => 'required|string|max:255',
            'customer_phone'       => 'required|string|max:20',
            'email'                => 'nullable|email|max:255',
            'description'          => 'nullable|string|max:1000',
            'items'                => 'required|array|min:1',
            'items.*.medicine_id'  => 'required|exists:medicines,id',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        $today = Carbon::today();

        $transaction = DB::transaction(function () use ($validated, $today) {
            $subtotal = 0;

            // 1) Validasi stok tersedia (non-expired) untuk setiap item
            foreach ($validated['items'] as $row) {
                $medicineId = (int) $row['medicine_id'];
                $qtyNeeded  = (int) $row['quantity'];

                $available = MedicineBatch::where('medicine_id', $medicineId)
                    ->whereDate('expiration_date', '>=', $today)
                    ->sum('qty');

                if ($available < $qtyNeeded) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok untuk obat ID {$medicineId} tidak cukup. Tersedia: {$available}, diminta: {$qtyNeeded}."]
                    ]);
                }
            }

            // 2) Buat transaksi (akan rollback otomatis jika ada error)
            $transaction = Transaction::create([
                'transaction_code' => 'TXN' . now()->format('YmdHis'),
                'customer_name'    => $validated['customer_name'],
                'customer_phone'   => $validated['customer_phone'],
                'email'            => $validated['email'] ?? null,
                'description'      => $validated['description'] ?? null,
                'subtotal'         => 0, // sementara, dihitung ulang
                'total'            => 0, // sementara, dihitung ulang
                'type'             => 'online', // sesuaikan kebutuhanmu
                'user_id'          => auth()->id(), // schema kamu NOT NULL → wajib login
            ]);

            // 3) FEFO issue: kurangi stok dari batch paling cepat kadaluarsa (non-expired)
            foreach ($validated['items'] as $row) {
                $medicine   = Medicine::findOrFail($row['medicine_id']);
                $qtyNeeded  = (int) $row['quantity'];
                $price      = $medicine->price;

                // Lock batch untuk obat ini → aman dari race condition
                $batches = MedicineBatch::where('medicine_id', $medicine->id)
                    ->where('qty', '>', 0)
                    ->whereDate('expiration_date', '>=', $today)
                    ->orderBy('expiration_date') // FEFO
                    ->lockForUpdate()
                    ->get();

                $remaining = $qtyNeeded;
                foreach ($batches as $batch) {
                    if ($remaining <= 0) break;
                    $take = min($batch->qty, $remaining);
                    if ($take <= 0) continue;

                    // Kurangi stok batch
                    $batch->decrement('qty', $take);
                    $remaining -= $take;
                }

                if ($remaining > 0) {
                    // Tidak cukup saat pengurangan (kondisi balapan) → gagalkan
                    throw ValidationException::withMessages([
                        'items' => ["Stok untuk {$medicine->name} berubah, tidak cukup untuk memenuhi pesanan."]
                    ]);
                }

                // Simpan item transaksi
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'medicine_id'    => $medicine->id,
                    'quantity'       => $qtyNeeded,
                    'price'          => $price,
                ]);

                $subtotal += $price * $qtyNeeded;
            }

            // 4) Update subtotal/total transaksi
            $transaction->update([
                'subtotal' => $subtotal,
                'total'    => $subtotal, // sesuaikan jika ada diskon/pajak
            ]);

            return $transaction;
        });

        // 5) Response JSON
        return response()->json([
            'success' => true,
            'transaction' => [
                'transaction_code' => $transaction->transaction_code,
                'customer_name'    => $transaction->customer_name,
                'customer_phone'   => $transaction->customer_phone,
                'email'            => $transaction->email,
                'description'      => $transaction->description,
                'subtotal'         => $transaction->subtotal,
                'total'            => $transaction->total,
                'created_at'       => $transaction->created_at->format('Y-m-d H:i:s'),
                'items'            => $transaction->items->map(function ($item) {
                    return [
                        'medicine_id' => $item->medicine_id,
                        'name'        => $item->medicine->name ?? null,
                        'quantity'    => $item->quantity,
                        'price'       => $item->price,
                        'subtotal'    => $item->quantity * $item->price,
                    ];
                }),
            ],
        ]);
    }
}
