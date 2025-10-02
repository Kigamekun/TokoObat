import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import {
    History,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    User,
    Receipt,
    Package,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "../Layouts/DashboardLayout";

const TransactionHistory = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState("all");
    const [cashierFilter, setCashierFilter] = useState("all");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Sample transaction history data
    const [transactions] = useState([
        {
            id: "TXN001",
            date: "2024-01-15",
            time: "14:30",
            customer: { name: "Ahmad Rahman", phone: "08123456789" },
            cashier: "Staff 1",
            items: [
                { name: "Paracetamol 500mg", quantity: 2, price: 5000 },
                { name: "Vitamin C 1000mg", quantity: 1, price: 12000 },
            ],
            subtotal: 22000,
            discount: 2200,
            total: 19800,
            paymentMethod: "Cash",
            status: "completed",
        },
        {
            id: "TXN002",
            date: "2024-01-15",
            time: "13:15",
            customer: { name: "Siti Nurhaliza", phone: "08234567890" },
            cashier: "Staff 2",
            items: [
                { name: "Amoxicillin 250mg", quantity: 3, price: 15000 },
                { name: "Ibuprofen 400mg", quantity: 2, price: 8000 },
                { name: "Cetirizine 10mg", quantity: 1, price: 10000 },
            ],
            subtotal: 71000,
            discount: 0,
            total: 71000,
            paymentMethod: "Card",
            status: "completed",
        },
        {
            id: "TXN003",
            date: "2024-01-14",
            time: "16:45",
            customer: { name: "Budi Santoso", phone: "" },
            cashier: "Admin",
            items: [
                { name: "Omeprazole 20mg", quantity: 1, price: 18000 },
                { name: "Metformin 500mg", quantity: 2, price: 6000 },
            ],
            subtotal: 30000,
            discount: 3000,
            total: 27000,
            paymentMethod: "Cash",
            status: "completed",
        },
        {
            id: "TXN004",
            date: "2024-01-14",
            time: "11:20",
            customer: { name: "Linda Sari", phone: "08345678901" },
            cashier: "Staff 1",
            items: [
                { name: "Loratadine 10mg", quantity: 4, price: 9000 },
                { name: "Vitamin C 1000mg", quantity: 2, price: 12000 },
            ],
            subtotal: 60000,
            discount: 0,
            total: 60000,
            paymentMethod: "Cash",
            status: "completed",
        },
        {
            id: "TXN005",
            date: "2024-01-13",
            time: "09:30",
            customer: { name: "Rina Dewi", phone: "08456789012" },
            cashier: "Staff 2",
            items: [
                { name: "Paracetamol 500mg", quantity: 3, price: 5000 },
                { name: "Ibuprofen 400mg", quantity: 1, price: 8000 },
            ],
            subtotal: 23000,
            discount: 1150,
            total: 21850,
            paymentMethod: "Card",
            status: "completed",
        },
        {
            id: "TXN006",
            date: "2024-01-13",
            time: "15:10",
            customer: { name: "", phone: "" },
            cashier: "Staff 1",
            items: [{ name: "Cetirizine 10mg", quantity: 1, price: 10000 }],
            subtotal: 10000,
            discount: 0,
            total: 10000,
            paymentMethod: "Cash",
            status: "completed",
        },
    ]);

    const cashiers = [...new Set(transactions.map((t) => t.cashier))];

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.customer.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            transaction.items.some((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesCashier =
            cashierFilter === "all" || transaction.cashier === cashierFilter;

        const matchesDate = () => {
            if (dateRange === "all") return true;
            const transactionDate = new Date(transaction.date);
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

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetails(true);
    };

    const handleExportHistory = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTransactions: filteredTransactions.length,
            totalAmount: filteredTransactions.reduce(
                (sum, t) => sum + t.total,
                0
            ),
            transactions: filteredTransactions,
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

    return (
        <DashboardLayout>
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
                            View and manage all past transactions and sales
                            records
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
                                    {formatCurrency(
                                        filteredTransactions.reduce(
                                            (sum, t) => sum + t.total,
                                            0
                                        )
                                    )}
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
                                    {formatCurrency(
                                        filteredTransactions.length > 0
                                            ? filteredTransactions.reduce(
                                                  (sum, t) => sum + t.total,
                                                  0
                                              ) / filteredTransactions.length
                                            : 0
                                    )}
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
                                    {filteredTransactions.reduce(
                                        (sum, t) =>
                                            sum +
                                            t.items.reduce(
                                                (itemSum, item) =>
                                                    itemSum + item.quantity,
                                                0
                                            ),
                                        0
                                    )}
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
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cashier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
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
                                            {transaction.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {formatDate(
                                                        transaction.date
                                                    )}
                                                </div>
                                                <div className="text-gray-500">
                                                    {transaction.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {transaction.customer
                                                        .name ||
                                                        "Walk-in Customer"}
                                                </div>
                                                {transaction.customer.phone && (
                                                    <div className="text-gray-500">
                                                        {
                                                            transaction.customer
                                                                .phone
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-400 mr-1" />
                                                {transaction.items.length}{" "}
                                                item(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            <div>
                                                <div>
                                                    {formatCurrency(
                                                        transaction.total
                                                    )}
                                                </div>
                                                {transaction.discount > 0 && (
                                                    <div className="text-green-600 text-xs">
                                                        Discount: -
                                                        {formatCurrency(
                                                            transaction.discount
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Badge
                                                variant={
                                                    transaction.paymentMethod ===
                                                    "Cash"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {transaction.paymentMethod}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.cashier}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className="bg-green-100 text-green-800">
                                                {transaction.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                onClick={() =>
                                                    handleViewDetails(
                                                        transaction
                                                    )
                                                }
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
                                            {selectedTransaction.id}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Date & Time:
                                        </span>
                                        <p>
                                            {formatDate(
                                                selectedTransaction.date
                                            )}{" "}
                                            at {selectedTransaction.time}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Cashier:
                                        </span>
                                        <p>{selectedTransaction.cashier}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Payment Method:
                                        </span>
                                        <p>
                                            {selectedTransaction.paymentMethod}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                {(selectedTransaction.customer.name ||
                                    selectedTransaction.customer.phone) && (
                                    <div className="border-b pb-4">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Customer Information
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            {selectedTransaction.customer
                                                .name && (
                                                <p>
                                                    <span className="font-medium text-gray-600">
                                                        Name:
                                                    </span>{" "}
                                                    {
                                                        selectedTransaction
                                                            .customer.name
                                                    }
                                                </p>
                                            )}
                                            {selectedTransaction.customer
                                                .phone && (
                                                <p>
                                                    <span className="font-medium text-gray-600">
                                                        Phone:
                                                    </span>{" "}
                                                    {
                                                        selectedTransaction
                                                            .customer.phone
                                                    }
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
                                        {selectedTransaction.items.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center py-2 border-b border-gray-100"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatCurrency(
                                                                item.price
                                                            )}{" "}
                                                            each
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            x{item.quantity}
                                                        </p>
                                                        <p className="text-sm font-semibold">
                                                            {formatCurrency(
                                                                item.price *
                                                                    item.quantity
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Subtotal:
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                selectedTransaction.subtotal
                                            )}
                                        </span>
                                    </div>
                                    {selectedTransaction.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>
                                                -
                                                {formatCurrency(
                                                    selectedTransaction.discount
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span className="text-teal-600">
                                            {formatCurrency(
                                                selectedTransaction.total
                                            )}
                                        </span>
                                    </div>
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
