import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    Home,
    ShoppingCart,
    Package,
    BarChart3,
    History,
    Users,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Shield,
} from "lucide-react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Badge } from "../Components/ui/badge";
import { toast } from "sonner";

import { router } from "@inertiajs/react";

import { Toaster } from "sonner";

const DashboardLayout = ({ children, user, onLogout }) => {
    console.log("User in DashboardLayout:", user); // Debugging line

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: Home,
            current:
                location.pathname === "/dashboard" || location.pathname === "/",
        },
        {
            name: "Transactions",
            href: "/transactions",
            icon: ShoppingCart,
            current: location.pathname === "/transactions",
        },
        {
            name: "Medicine Catalog",
            href: "/medicines",
            icon: Package,
            current: location.pathname === "/medicines",
        },
        {
            name: "Reports",
            href: "/reports",
            icon: BarChart3,
            current: location.pathname === "/reports",
        },
        {
            name: "Transaction History",
            href: "/history",
            icon: History,
            current: location.pathname === "/history",
        },
        // {
        //     name: "Analytics",
        //     href: "/analytics",
        //     icon: TrendingUp,
        //     current: location.pathname === "/analytics",
        // },
    ];

    // Admin-only navigation items
    if (user?.role === "admin") {
        navigation.push(
            {
                name: "User Management",
                href: "/users",
                icon: Users,
                current: location.pathname === "/users",
            },
            {
                name: "Settings",
                href: "/settings",
                icon: Settings,
                current: location.pathname === "/settings",
            }
        );
    }
    const handleLogout = () => {
        router.post(
            route("logout"),
            {},
            {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                },
            }
        );
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200 shadow-sm">
                        {/* Logo */}
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-6 mb-8">
                                <div className=" w-10 h-10 flex items-center justify-center">
                                    {/* image here */}
                                    <img
                                        src="/assets/images/logo.png"
                                        alt="Logo"
                                    />
                                </div>
                                <div className="ml-3">
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        Toko Obat
                                    </h1>
                                    <p className="text-xs text-teal-600 font-medium">
                                        JGroup
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 px-3 space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            data-testid={`nav-${item.name
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                            className={`${
                                                item.current
                                                    ? "bg-teal-50 border-r-2 border-teal-500 text-teal-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            } group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-all duration-200`}
                                        >
                                            <Icon
                                                className={`${
                                                    item.current
                                                        ? "text-teal-500"
                                                        : "text-gray-400 group-hover:text-gray-500"
                                                } mr-3 h-5 w-5`}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* User Profile */}
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center">
                                    <span className="text-teal-600 font-medium text-sm">
                                        {user?.name?.charAt(0) || "U"}
                                    </span>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p
                                        className="text-sm font-medium text-gray-700"
                                        data-testid="user-name"
                                    >
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    size="sm"
                                    data-testid="logout-button"
                                    className="text-gray-400 hover:text-gray-600 p-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar */}
            <div className={`md:hidden ${sidebarOpen ? "block" : "hidden"}`}>
                <div className="fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <Button
                                onClick={() => setSidebarOpen(false)}
                                variant="ghost"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:ring-2 focus:ring-white"
                            >
                                <X className="h-6 w-6 text-white" />
                            </Button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4 mb-8">
                                <div className="bg-teal-600 rounded-lg w-8 h-8 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-2">
                                    <h1 className="text-base font-semibold text-gray-900">
                                        Mitra Toko Obat
                                    </h1>
                                    <p className="text-xs text-teal-600 font-medium">
                                        JGroup
                                    </p>
                                </div>
                            </div>
                            <nav className="px-2 space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                            className={`${
                                                item.current
                                                    ? "bg-teal-50 text-teal-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                        >
                                            <Icon
                                                className={`${
                                                    item.current
                                                        ? "text-teal-500"
                                                        : "text-gray-400"
                                                } mr-4 h-6 w-6`}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center">
                                    <span className="text-teal-600 font-medium text-sm">
                                        {user?.name?.charAt(0) || "U"}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-base font-medium text-gray-700">
                                        {user?.name}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top navigation */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
                    <Button
                        onClick={() => setSidebarOpen(true)}
                        variant="ghost"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:ring-2 focus:ring-teal-500 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                        <div className="flex-1 flex items-center">
                            {/* Search Bar */}
                            <div className="w-full max-w-lg lg:max-w-xs relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Search medicines, transactions..."
                                    type="search"
                                    data-testid="search-input"
                                />
                            </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-4">
                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative"
                                data-testid="notifications-button"
                            >
                                <Bell className="h-5 w-5 text-gray-400" />
                                {/* <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                                    3
                                </Badge> */}
                            </Button>

                            {/* Mobile user menu */}
                            <div className="md:hidden">
                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <LogOut className="h-5 w-5 text-gray-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}

                            <Toaster
                                position="top-right"
                                expand={true}
                                richColors
                                closeButton
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
