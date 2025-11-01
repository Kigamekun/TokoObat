<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class CartController extends Controller
{
    private function availableStock(int $medicineId): int
    {
        return (int) MedicineBatch::where('medicine_id', $medicineId)
            ->whereDate('expiration_date', '>=', Carbon::today())
            ->sum('qty');
    }

    public function index(Request $request)
    {
        $cart = session()->get('cart', []);
        return Inertia::render('Cart', ['cart' => $cart]);
    }

    public function add(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        $cart     = session()->get('cart', []);
        $inCart   = isset($cart[$id]) ? (int) $cart[$id]['quantity'] : 0;
        $avail    = $this->availableStock((int) $id);

        if ($inCart + 1 > $avail) {
            return redirect()->back()->withErrors([
                'cart' => "Stok {$medicine->name} hanya tersedia {$avail}."
            ]);
        }

        if (isset($cart[$id])) {
            $cart[$id]['quantity']++;
        } else {
            $cart[$id] = [
                "name"     => $medicine->name,
                "price"    => $medicine->price,
                "quantity" => 1,
                "unit"     => $medicine->unit
            ];
        }

        session()->put('cart', $cart);
        return redirect()->back()->with('success', 'Medicine added to cart!');
    }

    public function update(Request $request, $id)
    {
        $qty = (int) $request->quantity;
        if ($qty <= 0) {
            return $this->remove($request, $id);
        }

        $medicine = Medicine::findOrFail($id);
        $avail    = $this->availableStock((int) $id);

        if ($qty > $avail) {
            // Batasi ke stok maksimum agar UX lebih ramah
            $qty = $avail;
            if ($qty <= 0) {
                return $this->remove($request, $id);
            }
            $msg = "Jumlah melebihi stok. Disesuaikan menjadi {$qty}.";
        }

        $cart = session()->get('cart', []);
        if (isset($cart[$id])) {
            $cart[$id]['quantity'] = $qty;
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', $msg ?? 'Cart updated!');
    }

    public function remove(Request $request, $id)
    {
        $cart = session()->get('cart', []);
        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('cart', $cart);
        }
        return redirect()->back()->with('success', 'Medicine removed from cart!');
    }

    public function clear()
    {
        session()->forget('cart');
        return redirect()->back()->with('success', 'Cart cleared!');
    }
}
