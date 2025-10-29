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
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string|max:1000',
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

            // Simpan transaksi (tanpa queue_number)
            $transaction = Transaction::create([
                'transaction_code' => 'TXN' . now()->format('YmdHis'),
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'email' => $validated['email'] ?? null,
                'description' => $validated['description'] ?? null,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'type' => 'online', // bisa kamu ganti sesuai kebutuhan
                'user_id' => auth()->check() ? auth()->id() : null, // jika login isi id, jika guest null
            ]);

            // Simpan item transaksi
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

        // ✅ Kirim langsung ke Inertia response
            return response()->json([
            'success' => true,
            'transaction' => [
                'transaction_code' => $transaction->transaction_code,
                'customer_name' => $transaction->customer_name,
                'customer_phone' => $transaction->customer_phone,
                'email' => $transaction->email,
                'description' => $transaction->description,
                'subtotal' => $transaction->subtotal,
                'total' => $transaction->total,
                'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                'items' => $transaction->items->map(function ($item) {
                    return [
                        'medicine_id' => $item->medicine_id,
                        'name' => $item->medicine->name ?? null,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->quantity * $item->price,
                    ];
                }),
            ]
        ]);
    }
}
