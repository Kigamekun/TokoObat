import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
    ShoppingCart,
    Plus,
    Trash2,
    Search,
    Calculator,
    Receipt,
    User,
    Tag,
    Package,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "../Layouts/DashboardLayout";

const Transactions = () => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
    const [discount, setDiscount] = useState({ type: "none", value: 0 });
    const [showReceipt, setShowReceipt] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);

    // Sample medicines data
    const medicines = [
        {
            id: 1,
            name: "Paracetamol 500mg",
            price: 5000,
            stock: 100,
            category: "Pain Relief",
            unit: "tablet",
        },
        {
            id: 2,
            name: "Amoxicillin 250mg",
            price: 15000,
            stock: 50,
            category: "Antibiotic",
            unit: "capsule",
        },
        {
            id: 3,
            name: "Ibuprofen 400mg",
            price: 8000,
            stock: 75,
            category: "Pain Relief",
            unit: "tablet",
        },
        {
            id: 4,
            name: "Vitamin C 1000mg",
            price: 12000,
            stock: 120,
            category: "Supplement",
            unit: "tablet",
        },
        {
            id: 5,
            name: "Cetirizine 10mg",
            price: 10000,
            stock: 60,
            category: "Allergy",
            unit: "tablet",
        },
        {
            id: 6,
            name: "Omeprazole 20mg",
            price: 18000,
            stock: 40,
            category: "Gastric",
            unit: "capsule",
        },
        {
            id: 7,
            name: "Loratadine 10mg",
            price: 9000,
            stock: 80,
            category: "Allergy",
            unit: "tablet",
        },
        {
            id: 8,
            name: "Metformin 500mg",
            price: 6000,
            stock: 90,
            category: "Diabetes",
            unit: "tablet",
        },
    ];

    const filteredMedicines = medicines.filter(
        (medicine) =>
            medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (medicine) => {
        const existingItem = cart.find((item) => item.id === medicine.id);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.id === medicine.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...medicine, quantity: 1 }]);
        }
        toast.success(`${medicine.name} added to cart`);
    };

    const updateQuantity = (id, quantity) => {
        if (quantity === 0) {
            removeFromCart(id);
            return;
        }
        setCart(
            cart.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    const removeFromCart = (id) => {
        const item = cart.find((item) => item.id === id);
        setCart(cart.filter((item) => item.id !== id));
        toast.success(`${item.name} removed from cart`);
    };

    const calculateSubtotal = () => {
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        if (discount.type === "percentage") {
            return (subtotal * discount.value) / 100;
        } else if (discount.type === "fixed") {
            return discount.value;
        }
        return 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const processTransaction = () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        const transaction = {
            id: `TXN${Date.now()}`,
            date: new Date().toLocaleString("id-ID"),
            customer: customerInfo,
            items: cart,
            subtotal: calculateSubtotal(),
            discount: calculateDiscount(),
            total: calculateTotal(),
            cashier: "Current User",
        };

        setCurrentTransaction(transaction);
        setShowReceipt(true);

        // Clear cart after transaction
        setCart([]);
        setCustomerInfo({ name: "", phone: "" });
        setDiscount({ type: "none", value: 0 });

        toast.success("Transaction completed successfully!");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="transactions-title"
                        >
                            New Transaction
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Process medicine sales and manage transactions
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Medicine Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search */}
                        <Card className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Search medicines by name or category..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 h-12"
                                    data-testid="medicine-search"
                                />
                            </div>
                        </Card>

                        {/* Medicine Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredMedicines.map((medicine) => (
                                <Card
                                    key={medicine.id}
                                    className="p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {medicine.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {medicine.category}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-teal-600">
                                                    {formatCurrency(
                                                        medicine.price
                                                    )}
                                                </span>
                                                <Badge
                                                    variant={
                                                        medicine.stock > 20
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {medicine.stock}{" "}
                                                    {medicine.unit}s
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                                                <Package className="w-6 h-6 text-teal-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => addToCart(medicine)}
                                        className="w-full bg-teal-600 hover:bg-teal-700"
                                        data-testid={`add-medicine-${medicine.id}`}
                                        disabled={medicine.stock === 0}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add to Cart
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Cart & Checkout */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-teal-600" />
                                Customer Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="customer-name">Name</Label>
                                    <Input
                                        id="customer-name"
                                        type="text"
                                        placeholder="Customer name (optional)"
                                        value={customerInfo.name}
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                name: e.target.value,
                                            })
                                        }
                                        data-testid="customer-name-input"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer-phone">
                                        Phone
                                    </Label>
                                    <Input
                                        id="customer-phone"
                                        type="tel"
                                        placeholder="Phone number (optional)"
                                        value={customerInfo.phone}
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                phone: e.target.value,
                                            })
                                        }
                                        data-testid="customer-phone-input"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Shopping Cart */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <ShoppingCart className="w-5 h-5 mr-2 text-teal-600" />
                                Cart ({cart.length})
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        Cart is empty
                                    </p>
                                ) : (
                                    cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatCurrency(item.price)}{" "}
                                                    each
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        }
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity +
                                                                    1
                                                            )
                                                        }
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                    className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Discount */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Tag className="w-5 h-5 mr-2 text-teal-600" />
                                Discount
                            </h3>
                            <div className="space-y-4">
                                <Select
                                    value={discount.type}
                                    onValueChange={(value) =>
                                        setDiscount({
                                            ...discount,
                                            type: value,
                                        })
                                    }
                                >
                                    <SelectTrigger data-testid="discount-type-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No Discount
                                        </SelectItem>
                                        <SelectItem value="percentage">
                                            Percentage (%)
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            Fixed Amount
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {discount.type !== "none" && (
                                    <Input
                                        type="number"
                                        placeholder={
                                            discount.type === "percentage"
                                                ? "Percentage"
                                                : "Amount"
                                        }
                                        value={discount.value}
                                        onChange={(e) =>
                                            setDiscount({
                                                ...discount,
                                                value:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                        data-testid="discount-value-input"
                                    />
                                )}
                            </div>
                        </Card>

                        {/* Order Summary */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-teal-600" />
                                Order Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(calculateSubtotal())}
                                    </span>
                                </div>
                                {discount.type !== "none" &&
                                    calculateDiscount() > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>
                                                -
                                                {formatCurrency(
                                                    calculateDiscount()
                                                )}
                                            </span>
                                        </div>
                                    )}
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-teal-600">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={processTransaction}
                                disabled={cart.length === 0}
                                className="w-full mt-4 bg-teal-600 hover:bg-teal-700 h-12"
                                data-testid="process-transaction-button"
                            >
                                <Receipt className="w-5 h-5 mr-2" />
                                Process Transaction
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Receipt Modal */}
                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Transaction Receipt</DialogTitle>
                        </DialogHeader>
                        {currentTransaction && (
                            <div
                                className="space-y-4"
                                data-testid="transaction-receipt"
                            >
                                <div className="text-center border-b pb-4">
                                    <h3 className="font-bold text-lg">
                                        Mitra Toko Obat JGroup
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Transaction: {currentTransaction.id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {currentTransaction.date}
                                    </p>
                                </div>

                                {currentTransaction.customer.name && (
                                    <div className="border-b pb-2">
                                        <p className="font-medium">
                                            Customer:{" "}
                                            {currentTransaction.customer.name}
                                        </p>
                                        {currentTransaction.customer.phone && (
                                            <p className="text-sm text-gray-600">
                                                Phone:{" "}
                                                {
                                                    currentTransaction.customer
                                                        .phone
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {currentTransaction.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span>
                                                {item.name} x{item.quantity}
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    item.price * item.quantity
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-2 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>
                                            {formatCurrency(
                                                currentTransaction.subtotal
                                            )}
                                        </span>
                                    </div>
                                    {currentTransaction.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>
                                                -
                                                {formatCurrency(
                                                    currentTransaction.discount
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-1">
                                        <span>Total</span>
                                        <span>
                                            {formatCurrency(
                                                currentTransaction.total
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center text-sm text-gray-600 border-t pt-2">
                                    <p>Cashier: {currentTransaction.cashier}</p>
                                    <p className="mt-2">
                                        Thank you for your purchase!
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
