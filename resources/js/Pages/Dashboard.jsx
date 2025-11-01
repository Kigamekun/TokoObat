import React, { useState, useEffect } from "react";
import { Card } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Head, usePage } from "@inertiajs/react";
import { Badge } from "../Components/ui/badge";
import { Link } from "@inertiajs/react";

import {
    TrendingUp,
    TrendingDown,
    Package,
    AlertTriangle,
    DollarSign,
    Users,
    Calendar,
    Clock,
    ShoppingCart,
    Eye,
} from "lucide-react";
import DashboardLayout from "../Layouts/DashboardLayout";

const Dashboard = () => {
    const { props } = usePage();
    const user = props.auth.user;

    const dashboardData = props.dashboardData; // <-- REAL DATA

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const StatCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        trend,
        color = "teal",
    }) => {
        const colorClasses = {
            teal: "bg-teal-50 text-teal-600",
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            orange: "bg-orange-50 text-orange-600",
            red: "bg-red-50 text-red-600",
            purple: "bg-purple-50 text-purple-600",
        };

        return (
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-1">
                                {subtitle}
                            </p>
                        )}
                        {trend && (
                            <div className="flex items-center mt-2">
                                {trend > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        trend > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {Math.abs(trend)}%
                                </span>
                                <span className="text-sm text-gray-500 ml-1">
                                    from yesterday
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        <Icon className="w-8 h-8" />
                    </div>
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
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="dashboard-title"
                        >
                            Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back! Here's what's happening at your
                            pharmacy today.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Sales"
                        value={formatCurrency(dashboardData.todaySales.amount)}
                        subtitle={`${dashboardData.todaySales.transactions} transactions`}
                        icon={DollarSign}
                        trend={dashboardData.todaySales.change}
                        color="teal"
                    />
                    <StatCard
                        title="Total Medicines"
                        value={dashboardData.totalMedicines.count}
                        subtitle={`${dashboardData.totalMedicines.categories} categories`}
                        icon={Package}
                        color="blue"
                    />
                    <StatCard
                        title="Low Stock Alerts"
                        value={dashboardData.lowStockAlerts}
                        subtitle="Require attention"
                        icon={AlertTriangle}
                        color="orange"
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={dashboardData.expiringSoon}
                        subtitle="Within 30 days"
                        icon={Clock}
                        color="red"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Best Selling Medicines */}
                    <Card className="lg:col-span-2">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Best Selling Medicines
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    data-testid="view-all-medicines"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View All
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.topSellingMedicines.map(
                                    (medicine, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {medicine.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {medicine.sales} units
                                                        sold
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        medicine.revenue
                                                    )}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-100 text-green-800"
                                                >
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Alerts Panel */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Alerts & Notifications
                            </h3>
                            <div className="space-y-3">
                                {dashboardData.alerts.map((alert, index) => {
                                    const alertStyles = {
                                        high: "border-red-200 bg-red-50",
                                        medium: "border-orange-200 bg-orange-50",
                                        low: "border-blue-200 bg-blue-50",
                                    };

                                    const iconStyles = {
                                        high: "text-red-600",
                                        medium: "text-orange-600",
                                        low: "text-blue-600",
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className={`p-3 border rounded-lg ${
                                                alertStyles[alert.priority]
                                            }`}
                                            data-testid={`alert-${alert.priority}-${index}`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                <AlertTriangle
                                                    className={`w-4 h-4 mt-0.5 ${
                                                        iconStyles[
                                                            alert.priority
                                                        ]
                                                    }`}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {alert.message}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 capitalize">
                                                        {alert.priority}{" "}
                                                        priority
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <br />

                            <Button
                                asChild
                                className="mt-2 w-full"
                                variant="outline"
                            >
                                <Link href="/alerts">View Alerts</Link>
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Transactions
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                data-testid="view-all-transactions"
                            >
                                <Eye className="w-4 h-4 mr-1" />
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cashier
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.recentTransactions.map(
                                        (transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                                                    {transaction.id}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.customer}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {transaction.items} items
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {transaction.time}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {transaction.cashier}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
