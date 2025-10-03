<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        $medicines = Medicine::where('stock', '>', 0)
            ->where('expiration_date', '>', now())
            ->get()
            ->map(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'price' => (float) $medicine->price,
                    'stock' => $medicine->stock,
                    'category' => $medicine->category,
                    'unit' => $medicine->unit,
                ];
            });

        return Inertia::render('Transactions', [
            'medicines' => $medicines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer.name' => 'nullable|string|max:255',
            'customer.phone' => 'nullable|string|max:20',
            'discount.type' => 'required|in:none,percentage,fixed',
            'discount.value' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                // Calculate subtotal and check stock
                $subtotal = 0;
                $items = [];

                foreach ($validated['items'] as $item) {
                    $medicine = Medicine::findOrFail($item['id']);

                    if ($medicine->stock < $item['quantity']) {
                        return back()->withErrors([
                            'message' => "Insufficient stock for {$medicine->name}. Available: {$medicine->stock}"
                        ]);
                    }

                    $itemTotal = $medicine->price * $item['quantity'];
                    $subtotal += $itemTotal;

                    $items[] = [
                        'medicine' => $medicine,
                        'quantity' => $item['quantity'],
                        'price' => $medicine->price,
                    ];
                }

                // Calculate discount
                $discount = 0;
                if ($validated['discount']['type'] === 'percentage') {
                    $discount = ($subtotal * $validated['discount']['value']) / 100;
                } elseif ($validated['discount']['type'] === 'fixed') {
                    $discount = min($validated['discount']['value'], $subtotal);
                }

                $total = $subtotal - $discount;

                // Create transaction
                $transaction = Transaction::create([
                    'customer_name' => $validated['customer']['name'] ?? null,
                    'customer_phone' => $validated['customer']['phone'] ?? null,
                    'discount_type' => $validated['discount']['type'],
                    'discount_value' => $discount,
                    'subtotal' => $subtotal,
                    'total' => $total,
                    'user_id' => Auth::id(),
                ]);

                // Create transaction items and update stock
                foreach ($items as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'medicine_id' => $item['medicine']->id,
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);

                    // Update medicine stock
                    $item['medicine']->decrement('stock', $item['quantity']);
                }

                // Reload transaction with relationships
                $transaction->load(['items.medicine', 'user']);

                // Return success with transaction data
                return redirect()->back()->with([
                    'success' => 'Transaction completed successfully!',
                    'transaction' => [
                        'id' => $transaction->transaction_code,
                        'date' => $transaction->created_at->format('Y-m-d H:i:s'),
                        'customer' => [
                            'name' => $transaction->customer_name,
                            'phone' => $transaction->customer_phone,
                        ],
                        'items' => $transaction->items->map(function ($item) {
                            return [
                                'name' => $item->medicine->name,
                                'quantity' => $item->quantity,
                                'price' => (float) $item->price,
                            ];
                        }),
                        'subtotal' => (float) $transaction->subtotal,
                        'discount' => (float) $transaction->discount_value,
                        'total' => (float) $transaction->total,
                        'cashier' => $transaction->user->name,
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors([
                'message' => $e->getMessage()
            ]);
        }
    }

    // Di dalam TransactionController yang sudah ada, tambahkan:

    public function history(Request $request)
    {
        $query = Transaction::with(['user', 'items.medicine']);

        // Search filter
        if ($request->has('search') && $request->search) {
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

        // Date range filter
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

        // Cashier filter
        if ($request->has('cashier') && $request->cashier !== 'all') {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', $request->cashier);
            });
        }

        $transactions = $query->latest()->paginate(20);

        return Inertia::render('TransactionHistory', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'date_range', 'cashier'])
        ]);
    }
}
