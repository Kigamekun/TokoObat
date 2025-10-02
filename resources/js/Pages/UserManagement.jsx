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
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    User,
    UserCheck,
    Key,
    Lock,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "../Layouts/DashboardLayout";

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [newUser, setNewUser] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        role: "staff",
        password: "",
        confirmPassword: "",
    });

    // Sample users data
    const [users, setUsers] = useState([
        {
            id: 1,
            username: "admin",
            fullName: "Administrator",
            email: "admin@pharmacy.com",
            phone: "08123456789",
            role: "admin",
            status: "active",
            lastLogin: "2024-01-15 10:30",
            createdAt: "2024-01-01",
        },
        {
            id: 2,
            username: "staff1",
            fullName: "Ahmad Rizky",
            email: "ahmad@pharmacy.com",
            phone: "08234567890",
            role: "staff",
            status: "active",
            lastLogin: "2024-01-15 14:20",
            createdAt: "2024-01-05",
        },
        {
            id: 3,
            username: "staff2",
            fullName: "Siti Rahmawati",
            email: "siti@pharmacy.com",
            phone: "08345678901",
            role: "staff",
            status: "active",
            lastLogin: "2024-01-15 12:45",
            createdAt: "2024-01-08",
        },
        {
            id: 4,
            username: "staff3",
            fullName: "Budi Santoso",
            email: "budi@pharmacy.com",
            phone: "08456789012",
            role: "staff",
            status: "inactive",
            lastLogin: "2024-01-10 16:15",
            createdAt: "2024-01-03",
        },
    ]);

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleAddUser = () => {
        if (
            !newUser.username ||
            !newUser.fullName ||
            !newUser.email ||
            !newUser.password
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (users.find((u) => u.username === newUser.username)) {
            toast.error("Username already exists");
            return;
        }

        if (users.find((u) => u.email === newUser.email)) {
            toast.error("Email already exists");
            return;
        }

        const user = {
            id: Date.now(),
            ...newUser,
            status: "active",
            lastLogin: null,
            createdAt: new Date().toISOString().split("T")[0],
        };

        // Remove password fields from stored user
        const { password, confirmPassword, ...userWithoutPassword } = user;
        setUsers([...users, userWithoutPassword]);

        setNewUser({
            username: "",
            fullName: "",
            email: "",
            phone: "",
            role: "staff",
            password: "",
            confirmPassword: "",
        });
        setShowAddModal(false);
        toast.success("User added successfully!");
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setNewUser({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            password: "",
            confirmPassword: "",
        });
        setShowAddModal(true);
    };

    const handleUpdateUser = () => {
        if (!newUser.username || !newUser.fullName || !newUser.email) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Check for duplicate username (excluding current user)
        if (
            users.find(
                (u) =>
                    u.username === newUser.username && u.id !== editingUser.id
            )
        ) {
            toast.error("Username already exists");
            return;
        }

        // Check for duplicate email (excluding current user)
        if (
            users.find(
                (u) => u.email === newUser.email && u.id !== editingUser.id
            )
        ) {
            toast.error("Email already exists");
            return;
        }

        // If password is provided, validate it
        if (newUser.password && newUser.password !== newUser.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const updatedUser = {
            ...editingUser,
            username: newUser.username,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
        };

        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));

        setNewUser({
            username: "",
            fullName: "",
            email: "",
            phone: "",
            role: "staff",
            password: "",
            confirmPassword: "",
        });
        setEditingUser(null);
        setShowAddModal(false);
        toast.success("User updated successfully!");
    };

    const handleToggleStatus = (userId) => {
        setUsers(
            users.map((user) => {
                if (user.id === userId) {
                    const newStatus =
                        user.status === "active" ? "inactive" : "active";
                    toast.success(
                        `User ${
                            newStatus === "active" ? "activated" : "deactivated"
                        } successfully!`
                    );
                    return { ...user, status: newStatus };
                }
                return user;
            })
        );
    };

    const handleDeleteUser = (userId) => {
        if (
            users.find(
                (u) =>
                    u.id === userId &&
                    u.role === "admin" &&
                    users.filter((u) => u.role === "admin").length === 1
            )
        ) {
            toast.error("Cannot delete the last admin user");
            return;
        }

        setUsers(users.filter((u) => u.id !== userId));
        toast.success("User deleted successfully!");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="user-management-title"
                        >
                            User Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage pharmacy staff accounts, roles, and
                            permissions
                        </p>
                    </div>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button
                                className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700"
                                data-testid="add-user-button"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add User
                            </Button>
                        </DialogTrigger>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {users.length}
                                </p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-full">
                                <Users className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Active Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {
                                        users.filter(
                                            (u) => u.status === "active"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Administrators
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {
                                        users.filter((u) => u.role === "admin")
                                            .length
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Staff Members
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {
                                        users.filter((u) => u.role === "staff")
                                            .length
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                                data-testid="user-search"
                            />
                        </div>

                        {/* Role Filter */}
                        <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                        >
                            <SelectTrigger data-testid="role-filter">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">
                                    Administrator
                                </SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {filteredUsers.length} of {users.length} users
                        </div>
                    </div>
                </Card>

                {/* Users Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <span className="text-teal-600 font-medium text-sm">
                                                            {user.fullName.charAt(
                                                                0
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="text-sm text-gray-500">
                                                    {user.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }
                                            >
                                                {user.role === "admin" ? (
                                                    <>
                                                        <Shield className="w-3 h-3 mr-1" />{" "}
                                                        Administrator
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-3 h-3 mr-1" />{" "}
                                                        Staff
                                                    </>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    user.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(user.lastLogin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-teal-600 hover:text-teal-700"
                                                    data-testid={`edit-user-${user.id}`}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            user.id
                                                        )
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    className={
                                                        user.status === "active"
                                                            ? "text-red-600 hover:text-red-700"
                                                            : "text-green-600 hover:text-green-700"
                                                    }
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    data-testid={`delete-user-${user.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {filteredUsers.length === 0 && (
                    <Card className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No users found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search or filters to find what
                            you're looking for.
                        </p>
                    </Card>
                )}

                {/* Add/Edit User Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingUser ? "Edit User" : "Add New User"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    value={newUser.username}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            username: e.target.value,
                                        })
                                    }
                                    data-testid="user-username-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full name"
                                    value={newUser.fullName}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            fullName: e.target.value,
                                        })
                                    }
                                    data-testid="user-fullname-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email address"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value,
                                        })
                                    }
                                    data-testid="user-email-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Phone number"
                                    value={newUser.phone}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            phone: e.target.value,
                                        })
                                    }
                                    data-testid="user-phone-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) =>
                                        setNewUser({ ...newUser, role: value })
                                    }
                                >
                                    <SelectTrigger data-testid="user-role-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            Administrator
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            Staff
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div></div>
                            <div>
                                <Label htmlFor="password">
                                    {editingUser
                                        ? "New Password"
                                        : "Password *"}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={
                                        editingUser
                                            ? "Leave blank to keep current password"
                                            : "Password"
                                    }
                                    value={newUser.password}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            password: e.target.value,
                                        })
                                    }
                                    data-testid="user-password-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">
                                    {editingUser
                                        ? "Confirm New Password"
                                        : "Confirm Password *"}
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={newUser.confirmPassword}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    data-testid="user-confirm-password-input"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingUser(null);
                                    setNewUser({
                                        username: "",
                                        fullName: "",
                                        email: "",
                                        phone: "",
                                        role: "staff",
                                        password: "",
                                        confirmPassword: "",
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={
                                    editingUser
                                        ? handleUpdateUser
                                        : handleAddUser
                                }
                                className="bg-teal-600 hover:bg-teal-700"
                                data-testid={
                                    editingUser
                                        ? "update-user-button"
                                        : "save-user-button"
                                }
                            >
                                {editingUser ? "Update User" : "Add User"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default UserManagement;
