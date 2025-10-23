<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Medicine;
use Inertia\Inertia;

class CartController extends Controller
{
    // Menampilkan isi cart
    public function index(Request $request)
    {
        $cart = session()->get('cart', []);

        return Inertia::render('Cart', [
            'cart' => $cart
        ]);
    }

    // Tambah ke cart
    public function add(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            // Jika obat sudah ada di cart, tambahkan jumlah
            $cart[$id]['quantity']++;
        } else {
            // Jika belum ada, masukkan ke cart
            $cart[$id] = [
                "name" => $medicine->name,
                "price" => $medicine->price,
                "quantity" => 1,
                "unit" => $medicine->unit
            ];
        }

        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Medicine added to cart!');
    }

    // Update jumlah item
    public function update(Request $request, $id)
    {
        if ($request->quantity <= 0) {
            return $this->remove($request, $id);
        }

        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] = $request->quantity;
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Cart updated!');
    }

    // Hapus item dari cart
    public function remove(Request $request, $id)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Medicine removed from cart!');
    }

    // Kosongkan cart
    public function clear()
    {
        session()->forget('cart');
        return redirect()->back()->with('success', 'Cart cleared!');
    }
}
