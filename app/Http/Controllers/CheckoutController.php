<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Medicine;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $transaction = DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $items = [];

            // Hitung subtotal (cek harga saja, stok tidak dikurangi)
            foreach ($validated['items'] as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);
                $subtotal += $medicine->price * $item['quantity'];
                $items[] = [
                    'medicine' => $medicine,
                    'quantity' => $item['quantity']
                ];
            }

            // Hitung nomor antrian
            $latestTransaction = Transaction::where('type', 'online')->latest()->first();
            $queueNumber = $latestTransaction ? $latestTransaction->queue_number + 1 : 1;
            $queueNumberFormatted = str_pad($queueNumber, 4, '0', STR_PAD_LEFT);

            // Simpan transaksi
            $transaction = Transaction::create([
                'transaction_code' => 'TXN' . now()->format('YmdHis'),
                'queue_number' => $queueNumberFormatted,
                'customer_name' => $validated['customer_name'] ?? 'Guest',
                'customer_phone' => $validated['customer_phone'] ?? null,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'type' => 'online',
                'user_id' => null,
            ]);

            // Simpan transaction items (tanpa mengurangi stock)
            foreach ($items as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'medicine_id' => $item['medicine']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['medicine']->price,
                ]);
            }

            return $transaction;
        });

        return response()->json([
            'success' => true,
            'transaction' => [
                'id' => $transaction->id,
                'transaction_code' => $transaction->transaction_code,
                'queue_number' => $transaction->queue_number,
                'customer_name' => $transaction->customer_name,
                'customer_phone' => $transaction->customer_phone,
                'subtotal' => $transaction->subtotal,
                'total' => $transaction->total,
                'items' => $transaction->items->map(function ($item) {
                    return [
                        'medicine' => [
                            'name' => $item->medicine->name,
                        ],
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
            ],
        ]);
    }
}
