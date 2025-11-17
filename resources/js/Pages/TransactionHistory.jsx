import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "../components/ui/dialog";
import {History, Search, Filter,Printer, Download, Eye, Calendar, User, Receipt, Package,} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../Layouts/DashboardLayout";
import axios from 'axios';

const TransactionHistory = () => {
    const { props } = usePage();
    const user = props.auth.user;


    const { transactions: initialTransactions, filters: initialFilters } = props;
    const [transactions, setTransactions] = useState(initialTransactions?.data || []);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
    const [dateRange, setDateRange] = useState(initialFilters?.date_range || "all");
    const [cashierFilter, setCashierFilter] = useState(initialFilters?.cashier || "all");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetails, setShowDetails] = useState(false);



    // Update transactions when props change
  useEffect(() => {
    setTransactions(initialTransactions?.data || []);
}, [initialTransactions]);

    // Get unique cashiers from transactions
    const cashiers = [...new Set(transactions.map((t) => t.user?.name || 'Unknown'))];

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.transaction_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.items?.some((item) =>
                item.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesCashier =
            cashierFilter === "all" || (transaction.user?.name === cashierFilter);

        const matchesDate = () => {
            if (dateRange === "all") return true;
            const transactionDate = new Date(transaction.created_at);
            const today = new Date();

            switch (dateRange) {
                case "today":
                    return (
                        transactionDate.toDateString() === today.toDateString()
                    );
                case "yesterday":
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    return (
                        transactionDate.toDateString() ===
                        yesterday.toDateString()
                    );
                case "7days":
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return transactionDate >= sevenDaysAgo;
                case "30days":
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    return transactionDate >= thirtyDaysAgo;
                default:
                    return true;
            }
        };

        return matchesSearch && matchesCashier && matchesDate();
    });

    // Apply filters with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (dateRange !== 'all') params.date_range = dateRange;
            if (cashierFilter !== 'all') params.cashier = cashierFilter;

            router.get(route('transactions.history'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, dateRange, cashierFilter]);

    const handleUpdateStatus = async (transactionId, newStatus) => {
        try {
            const response = await axios.patch(`/transactions/${transactionId}/status`, {
                status: newStatus,
            });
            if (response.data.success) {
                // Update the transaction status in local state
                setTransactions((prevTransactions) =>
                    prevTransactions.map((t) =>
                        t.id === transactionId ? { ...t, status: newStatus } : t
                    )
                );
                toast.success("Transaction status updated successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update transaction status.");
        }
    }
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("id-ID", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetails(true);
    };

    const handleCheckout = async (checkoutData) => {
        try {
            const response = await axios.post('/checkout', checkoutData);
            if (response.data.success) {
            const newTransaction = response.data.transaction;
            handleNewTransaction(newTransaction); // dari TransactionHistory.jsx
            toast.success("Checkout berhasil!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Checkout gagal!");
        }
    };


const buildReceiptHTML = (tx) => {
  const currency = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const date = new Date(tx.created_at);
  const tanggal = date.toLocaleDateString("id-ID", { year:"numeric", month:"short", day:"numeric" });
  const jam = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const itemsRows = (tx.items || []).map(i => `
    <tr>
      <td class="name">${i?.medicine?.name || "-"}</td>
      <td class="qty">x${i.quantity}</td>
      <td class="price">${currency(i.price)}</td>
      <td class="line">${currency(i.price * i.quantity)}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${tx.transaction_code}</title>
<style>
  *{box-sizing:border-box}
  body{font:14px/1.4 ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; color:#111; margin:0; padding:0;}
  .wrap{width:320px; margin:0 auto; padding:12px 10px;}
  h1{font-size:16px; margin:0; text-align:center;}
  .muted{color:#666; font-size:12px; text-align:center; margin:4px 0 10px}
  .row{display:flex; justify-content:space-between; margin:2px 0; font-size:13px}
  hr{border:0; border-top:1px dashed #999; margin:10px 0}
  table{width:100%; border-collapse:collapse; font-size:13px}
  td{padding:4px 0; vertical-align:top}
  td.name{width:48%}
  td.qty{width:10%; text-align:center}
  td.price{width:20%; text-align:right}
  td.line{width:22%; text-align:right}
  .totals .row{font-weight:600}
  .grand{font-size:15px}
  .center{text-align:center; margin-top:8px; font-size:12px; color:#444}
  @page{ size:auto; margin:8mm }
  @media print { body{ background:#fff } }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Mitra Toko Obat JGroup</h1>
    <div class="muted">Transaction Receipt</div>

    <div class="row"><div><b>ID</b></div><div>${tx.transaction_code}</div></div>
    <div class="row"><div><b>Tanggal</b></div><div>${tanggal} ${jam}</div></div>
    <div class="row"><div><b>Kasir</b></div><div>${tx?.user?.name || "-"}</div></div>
    ${tx.customer_name || tx.customer_phone ? `
      <div class="row"><div><b>Pelanggan</b></div><div>${tx.customer_name || "-"}</div></div>
      ${tx.customer_phone ? `<div class="row"><div><b>Telp</b></div><div>${tx.customer_phone}</div></div>` : ``}
    ` : ``}

    <hr>
    <table>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <hr>
    <div class="totals">
      <div class="row"><div>Subtotal</div><div>${currency(tx.subtotal || 0)}</div></div>
      ${tx.discount_value > 0 ? `<div class="row"><div>Diskon</div><div>-${currency(tx.discount_value)}</div></div>` : ``}
      <div class="row grand"><div>Total</div><div>${currency(tx.total || 0)}</div></div>
    </div>

    <div class="center">Terima kasih atas pembelian Anda!</div>
  </div>
  <script>
    window.onload = function(){ window.focus(); window.print(); window.onafterprint = () => window.close(); }
  </script>
</body>
</html>`;
};

const handlePrint = () => {
  if (!selectedTransaction) return;
  const html = buildReceiptHTML(selectedTransaction);
  const w = window.open("", "PRINT", "width=380,height=600");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
};



    const handleExportHistory = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTransactions: filteredTransactions.length,
            totalAmount: filteredTransactions.reduce(
                (sum, t) => sum + parseFloat(t.total),
                0
            ),
            transactions: filteredTransactions.map(t => ({
                id: t.transaction_code,
                date: t.created_at,
                customer: {
                    name: t.customer_name,
                    phone: t.customer_phone
                },
                cashier: t.user?.name,
                items: t.items?.map(item => ({
                    name: item.medicine?.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: t.subtotal,
                discount: t.discount_value,
                total: t.total,
                paymentMethod: "Cash", // You might want to add this field to your transactions
                status: "completed"
            })),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transaction-history-${
            new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Transaction history exported successfully!");
    };

    // Calculate summary statistics
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    const totalItems = filteredTransactions.reduce((sum, t) =>
        sum + (t.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
    );
    const averageTransaction = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;

    return (
        <DashboardLayout user={user}>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="transaction-history-title"
                        >
                            Transaction History
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View and manage all past transactions and sales records
                        </p>
                    </div>
                    <Button
                        onClick={handleExportHistory}
                        className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700"
                        data-testid="export-history-button"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export History
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Transactions
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {filteredTransactions.length}
                                </p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-full">
                                <Receipt className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full">
                                <History className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Average Transaction
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(averageTransaction)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Items Sold
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {totalItems}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                                data-testid="transaction-search"
                            />
                        </div>

                        {/* Date Range Filter */}
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger data-testid="date-filter">
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">
                                    Yesterday
                                </SelectItem>
                                <SelectItem value="7days">
                                    Last 7 Days
                                </SelectItem>
                                <SelectItem value="30days">
                                    Last 30 Days
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Cashier Filter */}
                        <Select
                            value={cashierFilter}
                            onValueChange={setCashierFilter}
                        >
                            <SelectTrigger data-testid="cashier-filter">
                                <SelectValue placeholder="All Cashiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Cashiers
                                </SelectItem>
                                {cashiers.map((cashier) => (
                                    <SelectItem key={cashier} value={cashier}>
                                        {cashier}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600">
                            <Filter className="w-4 h-4 mr-1" />
                            {filteredTransactions.length} of{" "}
                            {transactions.length} transactions
                        </div>
                    </div>
                </Card>

                {/* Transaction Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cashier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                                            {transaction.transaction_code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                                <div className="text-gray-500">
                                                    {formatTime(transaction.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {transaction.customer_name || "Walk-in Customer"}
                                                </div>
                                                {transaction.customer_phone && (
                                                    <div className="text-gray-500">
                                                        {transaction.customer_phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-400 mr-1" />
                                                {transaction.items?.length || 0} item(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatCurrency(transaction.total)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.description ? (
                                                <span className="text-gray-900">{transaction.description}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.discount_value > 0 ? (
                                                <span className="text-green-600">
                                                    -{formatCurrency(transaction.discount_value)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.status === 'pending' ? (

                                                <Button
                                                    onClick={() => handleUpdateStatus(transaction.id, 'complete')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    Mark as Complete
                                                </Button>

                                            ) : (
                                                <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Completed
                                                </Badge>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.user?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                onClick={() => handleViewDetails(transaction)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-teal-600 hover:text-teal-700"
                                                data-testid={`view-transaction-${transaction.id}`}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {filteredTransactions.length === 0 && (
                    <Card className="p-12 text-center">
                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No transactions found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search or filters to find what
                            you're looking for.
                        </p>
                    </Card>
                )}

                {/* Transaction Details Modal */}
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>
                        {selectedTransaction && (
                            <div
                                className="space-y-6"
                                data-testid="transaction-details"
                            >
                                {/* Header */}
                                <div className="text-center border-b pb-4">
                                    <h3 className="font-bold text-xl">
                                        Mitra Toko Obat JGroup
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        Transaction Receipt
                                    </p>
                                </div>

                                {/* Transaction Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Transaction ID:
                                        </span>
                                        <p className="font-mono">
                                            {selectedTransaction.transaction_code}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Date & Time:
                                        </span>
                                        <p>
                                            {formatDate(selectedTransaction.created_at)} at {formatTime(selectedTransaction.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Cashier:
                                        </span>
                                        <p>{selectedTransaction.user?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Discount Type:
                                        </span>
                                        <p className="capitalize">
                                            {selectedTransaction.discount_type}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                {(selectedTransaction.customer_name || selectedTransaction.customer_phone) && (
                                    <div className="border-b pb-4">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Customer Information
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            {selectedTransaction.customer_name && (
                                                <p>
                                                    <span className="font-medium text-gray-600">
                                                        Name:
                                                    </span>{" "}
                                                    {selectedTransaction.customer_name}
                                                </p>
                                            )}
                                            {selectedTransaction.customer_phone && (
                                                <p>
                                                    <span className="font-medium text-gray-600">
                                                        Phone:
                                                    </span>{" "}
                                                    {selectedTransaction.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Items */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Items Purchased
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedTransaction.items?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b border-gray-100"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.medicine?.name || 'Unknown Medicine'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatCurrency(item.price)} each
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        x{item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Subtotal:
                                        </span>
                                        <span>
                                            {formatCurrency(selectedTransaction.subtotal)}
                                        </span>
                                    </div>
                                    {selectedTransaction.discount_value > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>
                                                -{formatCurrency(selectedTransaction.discount_value)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span className="text-teal-600">
                                            {formatCurrency(selectedTransaction.total)}
                                        </span>
                                    </div>
                                </div>

<div className="flex justify-end gap-2 pt-2">
   <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
   <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700" data-testid="print-receipt-button">
     <Printer className="w-4 h-4 mr-2" /> Print Receipt
   </Button>
 </div>


                                <div className="text-center text-sm text-gray-600 border-t pt-4">
                                    <p>Thank you for your purchase!</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default TransactionHistory;
