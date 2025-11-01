import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { mockCart } from "../data/mock";
import "../../css/applanding.css";
import "../../css/app.css";
import "../../css/pharmacy.css";
import { Navigation } from "../components/Navigation";

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

    useEffect(() => {
        setCartItems([...mockCart.items]);
        setCartTotal(mockCart.total);
    }, []);

    const updateQuantity = (medicineId, newQuantity) => {
        mockCart.updateQuantity(medicineId, newQuantity);
        setCartItems([...mockCart.items]);
        setCartTotal(mockCart.total);
    };

    const removeItem = (medicineId) => {
        mockCart.removeItem(medicineId);
        setCartItems([...mockCart.items]);
        setCartTotal(mockCart.total);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container">
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Keranjang Kosong
                        </h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Anda belum menambahkan produk apapun ke keranjang.
                            Mari mulai berbelanja!
                        </p>
                        <Link href="/katalogobat" className="btn-primary">
                            Mulai Belanja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen pt-24 pb-12">
                <div className="container">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.visit("/katalogobat")}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Keranjang Belanja
                            </h1>
                            <p className="text-gray-600">
                                {cartItems.length} produk dalam keranjang
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={`/` + item.img}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {item.category}
                                                    </p>
                                                    <p className="text-lg font-bold text-teal-600 mt-2">
                                                        {formatPrice(
                                                            item.price
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>

                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                    disabled={
                                                        item.quantity >=
                                                        item.stock
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>

                                                <span className="text-sm text-gray-500 ml-2">
                                                    Stok: {item.stock}
                                                </span>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="mt-3 text-right">
                                                <p className="text-sm text-gray-600">
                                                    Subtotal:
                                                </p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {formatPrice(
                                                        item.price *
                                                            item.quantity
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    Ringkasan Pesanan
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal ({cartItems.length} produk)
                                        </span>
                                        <span className="font-medium">
                                            {formatPrice(cartTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Biaya Admin
                                        </span>
                                        <span className="font-medium">
                                            Gratis
                                        </span>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-bold">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-teal-600">
                                                {formatPrice(cartTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href="/checkout"
                                        className="w-full btn-primary text-center"
                                    >
                                        Lanjutkan ke Checkout
                                    </Link>

                                    <Link
                                        href="/katalogobat"
                                        className="w-full btn-secondary text-center"
                                    >
                                        Lanjutkan Belanja
                                    </Link>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Catatan:</strong> Pembayaran dan
                                        pengambilan obat dilakukan langsung di
                                        apotek kami.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
