import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
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
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Grid,
    List,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "../Layouts/DashboardLayout";

const MedicineCatalog = () => {
    const { props } = usePage();
    const user = props.auth.user;

    const { medicines: initialMedicines, categories: initialCategories, filters: initialFilters } = props;

    const [viewMode, setViewMode] = useState("grid");
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(initialFilters?.category || "all");
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || "all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    const [newMedicine, setNewMedicine] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        minStock: "",
        expirationDate: "",
        unit: "tablet",
        img: "",
        description: "",
    });

    // Use data from backend
    const [medicines, setMedicines] = useState(initialMedicines || []);
    const [categories, setCategories] = useState(initialCategories || []);

    // Update medicines when props change
    useEffect(() => {
        setMedicines(initialMedicines || []);
        setCategories(initialCategories || []);
    }, [initialMedicines, initialCategories]);

    // Filter medicines based on search, category, and status
    const filteredMedicines = medicines.filter((medicine) => {
        const matchesSearch =
            medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            medicine.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || medicine.category === categoryFilter;
        const matchesStatus =
            statusFilter === "all" || medicine.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Handle search and filters with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (categoryFilter !== 'all') params.category = categoryFilter;
            if (statusFilter !== 'all') params.status = statusFilter;

            router.get(route('medicines.index'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, statusFilter]);

    const getStatusInfo = (medicine) => {
        const today = new Date();
        const expiration = new Date(medicine.expirationDate);
        const daysUntilExpiration = Math.ceil(
            (expiration - today) / (1000 * 60 * 60 * 24)
        );

        if (expiration < today) {
            return {
                status: "expired",
                label: "Expired",
                color: "bg-red-100 text-red-800",
            };
        } else if (daysUntilExpiration <= 30) {
            return {
                status: "expiring",
                label: "Expiring Soon",
                color: "bg-orange-100 text-orange-800",
            };
        } else if (medicine.stock <= medicine.minStock) {
            return {
                status: "low-stock",
                label: "Low Stock",
                color: "bg-yellow-100 text-yellow-800",
            };
        } else {
            return {
                status: "available",
                label: "Available",
                color: "bg-green-100 text-green-800",
            };
        }
    };

    const handleAddMedicine = () => {
        if (!newMedicine.name || !newMedicine.category || !newMedicine.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        router.post(route('medicines.store'), newMedicine, {
            forceFormData: true,
            onSuccess: () => {
                setNewMedicine({
                    name: "",
                    category: "",
                    price: "",
                    stock: "",
                    minStock: "",
                    expirationDate: "",
                    unit: "tablet",
                    img: "",
                    description: "",
                });
                setShowAddModal(false);
                toast.success("Medicine added successfully!");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    const handleEditMedicine = (medicine) => {
        setEditingMedicine(medicine);
        setNewMedicine({
            name: medicine.name,
            category: medicine.category,
            price: medicine.price.toString(),
            stock: medicine.stock.toString(),
            minStock: medicine.minStock.toString(),
            expirationDate: medicine.expirationDate,
            unit: medicine.unit,
            description: medicine.description || "",
        });
        setShowAddModal(true);
    };

    const handleStockPage = (medicine) => {
        router.get(route('medicines.stock', medicine.id));
    }

    const handleUpdateMedicine = () => {
        if (!newMedicine.name || !newMedicine.category || !newMedicine.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        router.put(route('medicines.update', editingMedicine.id), newMedicine, {
            onSuccess: () => {
                setNewMedicine({
                    name: "",
                    category: "",
                    price: "",
                    stock: "",
                    minStock: "",
                    expirationDate: "",
                    unit: "tablet",
                    img: "",
                    description: "",
                });
                setEditingMedicine(null);
                setShowAddModal(false);
                toast.success("Medicine updated successfully!");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    const handleDeleteMedicine = (id) => {
        if (confirm('Are you sure you want to delete this medicine?')) {
            router.delete(route('medicines.destroy', id), {
                onSuccess: () => {
                    toast.success("Medicine deleted successfully!");
                },
                onError: () => {
                    toast.error("Failed to delete medicine");
                }
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const MedicineCard = ({ medicine }) => {
        const statusInfo = getStatusInfo(medicine);

        return (
            <Card className="p-4 hover:shadow-lg transition-all duration-200">

                <div className="medicine-item flex flex-col items-center">
                    {medicine.img ? (
                    <img
                        src={medicine.img}
                        alt={medicine.name}
                        className="w-full h-48 object-cover"
                    />
                    ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm bg-gray-100 rounded-lg">
                        No Image
                    </div>
                    )}
                    <div className="p-4 text-center space-y-2">
                        <h3 className="text-base font-semibold text-gray-800"></h3>
                    </div>

                </div>

                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            {medicine.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            {medicine.category}
                        </p>
                        <Badge className={statusInfo.color}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                    <div className="ml-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-teal-600">
                            {formatCurrency(medicine.price)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span
                            className={`font-semibold ${
                                medicine.stock <= medicine.minStock
                                    ? "text-red-600"
                                    : "text-gray-900"
                            }`}
                        >
                            {medicine.stock} {medicine.unit}s
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="text-gray-900">
                            {new Date(medicine.expirationDate).toLocaleDateString("id-ID")}
                        </span>
                    </div>
                </div>

                <div className="flex space-x-2 mt-4">
                    <Button
                        onClick={() => handleEditMedicine(medicine)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`edit-medicine-${medicine.id}`}
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        onClick={() => handleStockPage(medicine)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`edit-medicine-${medicine.id}`}
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Stock
                    </Button>

                    <Button
                        onClick={() => handleDeleteMedicine(medicine.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-medicine-${medicine.id}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <DashboardLayout user={user}>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900" data-testid="medicine-catalog-title">
                            Medicine Catalog
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your pharmacy inventory and medicine database
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                                onClick={() => setViewMode("grid")}
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                className="h-8"
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => setViewMode("list")}
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                className="h-8"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                            <DialogTrigger asChild>
                                <Button className="bg-teal-600 hover:bg-teal-700" data-testid="add-medicine-button">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Medicine
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search medicines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                                data-testid="medicine-search-input"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger data-testid="category-filter">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger data-testid="status-filter">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="low-stock">Low Stock</SelectItem>
                                <SelectItem value="expiring">Expiring Soon</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600">
                            <Filter className="w-4 h-4 mr-1" />
                            {filteredMedicines.length} of {medicines.length} medicines
                        </div>
                    </div>
                </Card>

                {/* Medicine Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMedicines.map((medicine) => (
                            <MedicineCard key={medicine.id} medicine={medicine} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Medicine
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiry
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
                                    {filteredMedicines.map((medicine) => {
                                        const statusInfo = getStatusInfo(medicine);
                                        return (
                                            <tr key={medicine.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {medicine.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {medicine.description}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {medicine.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600">
                                                    {formatCurrency(medicine.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={medicine.stock <= medicine.minStock ? "text-red-600 font-semibold" : ""}>
                                                        {medicine.stock} {medicine.unit}s
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(medicine.expirationDate).toLocaleDateString("id-ID")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={statusInfo.color}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => handleEditMedicine(medicine)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-teal-600 hover:text-teal-700"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteMedicine(medicine.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {filteredMedicines.length === 0 && (
                    <Card className="p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No medicines found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </Card>
                )}

                {/* Add/Edit Medicine Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="medicine-name">Medicine Name *</Label>
                                <Input
                                    id="medicine-name"
                                    type="text"
                                    placeholder="Medicine name"
                                    value={newMedicine.name}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                                    data-testid="medicine-name-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-category">Category *</Label>
                                <Input
                                    id="medicine-category"
                                    type="text"
                                    placeholder="Medicine category"
                                    value={newMedicine.category}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                                    data-testid="medicine-category-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-price">Price (IDR) *</Label>
                                <Input
                                    id="medicine-price"
                                    type="number"
                                    placeholder="Price"
                                    value={newMedicine.price}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                                    data-testid="medicine-price-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-stock">Current Stock *</Label>
                                <Input
                                    id="medicine-stock"
                                    type="number"
                                    placeholder="Current stock"
                                    value={newMedicine.stock}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                                    data-testid="medicine-stock-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-minstock">Minimum Stock *</Label>
                                <Input
                                    id="medicine-minstock"
                                    type="number"
                                    placeholder="Minimum stock alert level"
                                    value={newMedicine.minStock}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, minStock: e.target.value })}
                                    data-testid="medicine-minstock-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-unit">Unit</Label>
                                <Select
                                    value={newMedicine.unit}
                                    onValueChange={(value) => setNewMedicine({ ...newMedicine, unit: value })}
                                >
                                    <SelectTrigger data-testid="medicine-unit-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tablet">Tablet</SelectItem>
                                        <SelectItem value="capsule">Capsule</SelectItem>
                                        <SelectItem value="bottle">Bottle</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="tube">Tube</SelectItem>
                                        <SelectItem value="vial">Vial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="medicine-expiry">Expiration Date *</Label>
                                <Input
                                    id="medicine-expiry"
                                    type="date"
                                    value={newMedicine.expirationDate}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, expirationDate: e.target.value })}
                                    data-testid="medicine-expiry-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="medicine-img">Image</Label>
                                <Input
                                    id="medicine-img"
                                    type="file"
                                    onChange={(e) => setNewMedicine({ ...newMedicine, img: e.target.files[0] })}
                                    data-testid="medicine-img-input"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="medicine-description">Description</Label>
                                <Input
                                    id="medicine-description"
                                    type="text"
                                    placeholder="Medicine description (optional)"
                                    value={newMedicine.description}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                                    data-testid="medicine-description-input"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingMedicine(null);
                                    setNewMedicine({
                                        name: "",
                                        category: "",
                                        price: "",
                                        stock: "",
                                        minStock: "",
                                        expirationDate: "",
                                        unit: "tablet",
                                        description: "",
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
                                className="bg-teal-600 hover:bg-teal-700"
                                data-testid={editingMedicine ? "update-medicine-button" : "save-medicine-button"}
                            >
                                {editingMedicine ? "Update Medicine" : "Add Medicine"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};
export default MedicineCatalog;
