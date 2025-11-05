import React, { useState, useEffect } from "react";
import { mockCart } from "../data/mock";
import "../../css/applanding.css";
import "../../css/app.css";
import "../../css/pharmacy.css";
import { Navigation } from "../components/Navigation";

import { Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Check, MapPin, Clock, Phone, Printer } from "lucide-react";
import axios from "axios";

export default function Checkout() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        notes: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState("");
    const { flash } = usePage().props;
    const transaction = flash?.transaction;

    const [lastTx, setLastTx] = useState(null);

    const buildReceiptHTML = (tx) => {
        const currency = (n) =>
            new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(n || 0);
        const d = new Date(tx.created_at);
        const tgl = d.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const jam = d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const rows = (tx.items || [])
            .map(
                (i) => `
    <tr>
      <td class="name">${i.name || "-"}</td>
      <td class="qty">x${i.quantity}</td>
      <td class="price">${currency(i.price)}</td>
      <td class="line">${currency(i.quantity * i.price)}</td>
    </tr>
  `
            )
            .join("");

        return `<!doctype html>
<html><head><meta charset="utf-8"><title>Receipt ${tx.transaction_code}</title>
<style>
  *{box-sizing:border-box} body{font:14px/1.4 ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; color:#111; margin:0}
  .wrap{width:320px; margin:0 auto; padding:12px 10px}
  h1{font-size:16px; margin:0; text-align:center}
  .muted{color:#666; font-size:12px; text-align:center; margin:4px 0 10px}
  .row{display:flex; justify-content:space-between; margin:2px 0; font-size:13px}
  hr{border:0; border-top:1px dashed #999; margin:10px 0}
  table{width:100%; border-collapse:collapse; font-size:13px}
  td{padding:4px 0; vertical-align:top}
  td.name{width:48%} td.qty{width:10%; text-align:center}
  td.price{width:20%; text-align:right} td.line{width:22%; text-align:right}
  .totals .row{font-weight:600} .grand{font-size:15px}
  .center{text-align:center; margin-top:8px; font-size:12px; color:#444}
  @page{ size:auto; margin:8mm }
</style></head>
<body>
  <div class="wrap">
    <h1>Mitra Toko Obat JGroup</h1>
    <div class="muted">Transaction Receipt</div>

    <div class="row"><div><b>ID</b></div><div>${tx.transaction_code}</div></div>
    <div class="row"><div><b>Tanggal</b></div><div>${tgl} ${jam}</div></div>
    <div class="row"><div><b>Kasir</b></div><div>${
        tx.cashier || "-"
    }</div></div>
    ${
        tx.customer_name || tx.customer_phone
            ? `
      <div class="row"><div><b>Pelanggan</b></div><div>${
          tx.customer_name || "-"
      }</div></div>
      ${
          tx.customer_phone
              ? `<div class="row"><div><b>Telp</b></div><div>${tx.customer_phone}</div></div>`
              : ``
      }
    `
            : ``
    }

    <hr>
    <table><tbody>${rows}</tbody></table>

    <hr>
    <div class="totals">
      <div class="row"><div>Subtotal</div><div>${currency(
          tx.subtotal
      )}</div></div>
      ${
          tx.discount_value > 0
              ? `<div class="row"><div>Diskon</div><div>-${currency(
                    tx.discount_value
                )}</div></div>`
              : ``
      }
      <div class="row grand"><div>Total</div><div>${currency(
          tx.total
      )}</div></div>
    </div>

    <div class="center">Terima kasih atas pembelian Anda!</div>
  </div>
  <script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}</script>
</body></html>`;
    };

    const handlePrint = () => {
        if (!lastTx) return;
        const w = window.open("", "PRINT", "width=380,height=600");
        if (!w) return;
        w.document.open();
        w.document.write(buildReceiptHTML(lastTx));
        w.document.close();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 📨 Kirim data ke backend
            const res = await axios.post("/checkout", {
                customer_name: formData.name,
                customer_phone: formData.phone,
                email: formData.email,
                description: formData.notes,
                items: mockCart.items.map((item) => ({
                    medicine_id: item.id,
                    quantity: item.quantity,
                })),
            });

            // ✅ Jika backend mengembalikan transaction_code
            const transaction = res.data?.transaction;

            if (transaction?.transaction_code) {
                try {
                    // 🔁 Ambil detail transaksi setelah checkout

                    const data = transaction;
                    setOrderComplete(true);
                    setOrderId(data.transaction_code);
                    mockCart.clear();
                    console.log("Detail transaksi:", data);
                } catch (err) {
                    console.error("Gagal mengambil data transaksi:", err);
                    alert(
                        "Checkout berhasil, tapi gagal mengambil detail transaksi."
                    );
                }

                setLastTx(transaction);
                setOrderComplete(true);
                setOrderId(transaction.transaction_code);
                mockCart.clear();
                console.log('Detail transaksi:', transaction);

            } else {
                console.warn(
                    "Checkout sukses tapi transaction_code tidak diterima."
                );
            }
        } catch (error) {
            console.error("Checkout gagal:", error);
            alert("Terjadi kesalahan saat checkout.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (mockCart.items.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container">
                    <div className="text-center py-16">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Keranjang Kosong
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Tidak ada produk dalam keranjang untuk di-checkout.
                        </p>
                        <Link href="/katalogobat" className="btn-primary">
                            Mulai Belanja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Pesanan Berhasil Diterima!
                        </h1>

                        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                            <p className="text-lg text-gray-600 mb-4">
                                Terima kasih atas pesanan Anda. Pesanan dengan
                                nomor:
                            </p>
                            <p className="text-2xl font-bold text-teal-600 mb-6">
                                #{orderId}
                            </p>
                            <p className="text-gray-700 mb-6">
                                telah diterima dan sedang diproses. Silakan
                                datang ke apotek kami untuk melakukan pembayaran
                                dan pengambilan obat.
                            </p>

                            {/* Store Info */}

                            <div className="bg-gray-50 rounded-lg p-6 text-left">
                                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                                    Informasi Apotek
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                Alamat
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Jl. Raya Kesehatan No. 123,
                                                Kelurahan Sehat, Kecamatan Obat,
                                                Jakarta Selatan 12345
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                Jam Operasional
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Senin-Sabtu: 08.00-22.00
                                                <br />
                                                Minggu: 08.00-20.00
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                Telepon
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                +62 21 1234 5678
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {lastTx && (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6 text-left">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">Daftar Obat Dipesan</h3>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
      >
        <Printer className="h-4 w-4" /> Print
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-500 uppercase tracking-wider">
            <th className="py-2 text-left">Nama Obat</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Harga</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lastTx.items?.map((it, idx) => (
            <tr key={idx}>
              <td className="py-2 text-gray-900">{it.name || '-'}</td>
              <td className="py-2 text-center">x{it.quantity}</td>
              <td className="py-2 text-right">{formatPrice(it.price)}</td>
              <td className="py-2 text-right font-medium">
                {formatPrice(it.price * it.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t">
          <tr>
            <td colSpan={3} className="py-2 text-right text-gray-600">Subtotal</td>
            <td className="py-2 text-right">{formatPrice(lastTx.subtotal)}</td>
          </tr>
          {Number(lastTx.discount_value) > 0 && (
            <tr>
              <td colSpan={3} className="py-2 text-right text-gray-600">Diskon</td>
              <td className="py-2 text-right text-green-600">
                -{formatPrice(lastTx.discount_value)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="py-2 text-right font-semibold">Total</td>
            <td className="py-2 text-right font-bold text-teal-600">
              {formatPrice(lastTx.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
)}

                        </div>

                        <div className="space-y-4">
                            <Link to="/" className="btn-primary">
                                Kembali ke Beranda
                            </Link>
                            <Link to="/katalog" className="btn-secondary">
                                Belanja Lagi
                            </Link>
                        </div>
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
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Pre-order
                            </h1>
                            <p className="text-gray-600">
                                Lengkapi data untuk menyelesaikan pesanan
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                        Informasi Pemesan
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                                placeholder="Masukkan nama lengkap Anda"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor Telepon *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                                placeholder="08xxxxxxxxxx"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email (Opsional)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            placeholder="email@example.com"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                            placeholder="Catatan khusus untuk pesanan Anda..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                                    <h4 className="font-semibold text-blue-900 mb-3">
                                        Informasi Penting:
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-2">
                                        <li>
                                            • Pembayaran dilakukan langsung di
                                            apotek saat pengambilan obat
                                        </li>
                                        <li>
                                            • Pesanan akan disiapkan dalam waktu
                                            30 menit setelah konfirmasi
                                        </li>
                                        <li>
                                            • Silakan tunjukkan nomor pesanan
                                            saat datang ke apotek
                                        </li>
                                        <li>
                                            • Bawa kartu identitas untuk
                                            verifikasi
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !formData.name ||
                                        !formData.phone
                                    }
                                    className={`w-full py-4 rounded-full font-semibold transition-all ${
                                        isSubmitting ||
                                        !formData.name ||
                                        !formData.phone
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg"
                                    }`}
                                >
                                    {isSubmitting
                                        ? "Memproses Pesanan..."
                                        : "Konfirmasi Pesanan"}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    Ringkasan Pesanan
                                </h3>

                                <div className="space-y-4 mb-6">
                                    {mockCart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-3"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={"/" + item.img}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {item.quantity}x{" "}
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium">
                                                {formatPrice(
                                                    item.price * item.quantity
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatPrice(mockCart.total)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span className="text-gray-600">
                                            Biaya Admin
                                        </span>
                                        <span className="font-medium">
                                            Gratis
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-teal-600">
                                            {formatPrice(mockCart.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
