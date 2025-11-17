// resources/js/Pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";

import DashboardLayout from "../Layouts/DashboardLayout";

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
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";

import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Phone,
  Mail,
  UserCircle2,
  Power,
  Clock,
  Edit2,
  Lock, // ⬅️ tambahkan ini
} from "lucide-react";


const UserManagement = () => {
  const { props } = usePage();
    const user = props.auth.user;

  const {
    users: initialUsers,
    filters: initialFilters,
    roles: availableRoles = ["admin", "cashier", "owner"],
  } = props;

  const [users, setUsers] = useState(initialUsers?.data || []);
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
  const [roleFilter, setRoleFilter] = useState(initialFilters?.role || "all");
  const [statusFilter, setStatusFilter] = useState(
    initialFilters?.status || "all"
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: availableRoles[0] || "cashier",
    status: "active",
    password: "",
    password_confirmation: "",
  });

  // Update users when props change (pagination / filter via backend)
  useEffect(() => {
    setUsers(initialUsers?.data || []);
  }, [initialUsers]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: availableRoles[0] || "cashier",
      status: "active",
      password: "",
      password_confirmation: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || availableRoles[0] || "cashier",
      status: user.status || "active",
      password: "",
      password_confirmation: "",
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (selectedUser) {
        // Update existing user
        response = await axios.put(`/users/${selectedUser.id}`, form);
      } else {
        // Create new user
        response = await axios.post("/users", form);
      }

      if (response.data.success) {
        const savedUser = response.data.user;

        setUsers((prev) => {
          const idx = prev.findIndex((u) => u.id === savedUser.id);
          if (idx !== -1) {
            const clone = [...prev];
            clone[idx] = savedUser;
            return clone;
          }
          return [savedUser, ...prev];
        });

        toast.success(
          selectedUser ? "User updated successfully!" : "User created successfully!"
        );
        setIsFormOpen(false);
      } else {
        toast.error("Failed to save user.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save user.");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      const response = await axios.patch(`/users/${user.id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: newStatus } : u
          )
        );
        toast.success("User status updated.");
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  };

  // Frontend filtering (untuk summary dan table)
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sinkronisasi filter ke URL (backend) pakai debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      router.get(route("users.index"), params, {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter]);

  // Summary
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((u) => u.status === "active").length;
  const inactiveUsers = filteredUsers.filter(
    (u) => u.status === "inactive"
  ).length;
  const neverLoggedIn = filteredUsers.filter((u) => !u.last_login).length;

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return (
      d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola akun pengguna, peran, dan status akses sistem.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
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
                  {totalUsers}
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
                  {activeUsers}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Power className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Inactive Users
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inactiveUsers}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Never Logged In
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {neverLoggedIn}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-1" />
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
                    Name
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
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col gap-1">
                        {user.email && (
                          <div className="flex items-center gap-1 text-gray-700">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Badge className="bg-blue-50 text-blue-800 capitalize">
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.status === "active" ? (
                        <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(user.last_login)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            user.status === "active"
                              ? "text-red-600 border-red-200 hover:text-red-700"
                              : "text-green-600 border-green-200 hover:text-green-700"
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
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
              Coba ubah kata kunci pencarian atau filter role/status.
            </p>
          </Card>
        )}

        {/* Create / Edit User Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Create New User"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
               
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    required
                  />
                </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) => handleFormChange("role", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => handleFormChange("status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">
                    Password{" "}
                    {selectedUser && (
                      <span className="text-xs text-gray-500">
                      </span>
                    )}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="password_confirmation">
                    Confirm Password
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) =>
                      handleFormChange(
                        "password_confirmation",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {selectedUser ? "Save Changes" : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
