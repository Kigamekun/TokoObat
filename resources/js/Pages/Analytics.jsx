import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { usePage } from "@inertiajs/react";
import { Badge } from "../components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    Calendar,
    Award,
    AlertTriangle,
    Star,
    BarChart3,
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
);
import DashboardLayout from "../Layouts/DashboardLayout";

const Analytics = () => {
    const { props } = usePage();
    const { analytics, period } = props;

    const [selectedPeriod, setSelectedPeriod] = useState("30days");
    const [selectedMetric, setSelectedMetric] = useState("revenue");

    // Sample analytics data
    const analyticsData = analytics;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getTrendData = () => {
        const data = analyticsData.salesTrend?.[selectedPeriod] ?? {
            labels: [],
            revenue: [],
            transactions: [],
            customers: [],
        };

        return {
            labels: data.labels,
            datasets: [
                {
                    label:
                        selectedMetric === "revenue"
                            ? "Revenue (IDR)"
                            : selectedMetric === "transactions"
                            ? "Transactions"
                            : "Customers",
                    data: data[selectedMetric],
                    borderColor: "#66b9b6",
                    backgroundColor: "rgba(102, 185, 182, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `${
                    selectedMetric.charAt(0).toUpperCase() +
                    selectedMetric.slice(1)
                } Trend Analysis`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        if (selectedMetric === "revenue") {
                            return formatCurrency(value);
                        }
                        return value;
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            },
            title: {
                display: true,
                text: "Revenue by Category",
            },
        },
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case "positive":
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            case "negative":
                return <TrendingDown className="w-5 h-5 text-red-600" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            default:
                return <BarChart3 className="w-5 h-5 text-blue-600" />;
        }
    };

    const getInsightColor = (type) => {
        switch (type) {
            case "positive":
                return "border-green-200 bg-green-50";
            case "negative":
                return "border-red-200 bg-red-50";
            case "warning":
                return "border-orange-200 bg-orange-50";
            default:
                return "border-blue-200 bg-blue-50";
        }
    };

    const categoryData =
        analyticsData.categoryPerformance.length > 0
            ? {
                  labels: analyticsData.categoryPerformance.map((c) => c.name),
                  datasets: [
                      {
                          data: analyticsData.categoryPerformance.map(
                              (c) => c.revenue
                          ),
                          backgroundColor: [
                              "#66b9b6",
                              "#facc15",
                              "#f87171",
                              "#60a5fa",
                              "#f472b6",
                          ],
                      },
                  ],
              }
            : {
                  labels: [],
                  datasets: [{ data: [], backgroundColor: [] }],
              };

    return (
        <DashboardLayout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="analytics-title"
                        >
                            Analytics & Insights
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Deep insights into medicine sales performance and
                            market trends
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Period
                            </label>
                            <Select
                                value={selectedPeriod}
                                onValueChange={setSelectedPeriod}
                            >
                                <SelectTrigger data-testid="analytics-period-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">
                                        Last 7 Days
                                    </SelectItem>
                                    <SelectItem value="30days">
                                        Last 30 Days
                                    </SelectItem>
                                    <SelectItem value="90days">
                                        Last 90 Days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metric
                            </label>
                            <Select
                                value={selectedMetric}
                                onValueChange={setSelectedMetric}
                            >
                                <SelectTrigger data-testid="analytics-metric-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revenue">
                                        Revenue
                                    </SelectItem>
                                    <SelectItem value="transactions">
                                        Transactions
                                    </SelectItem>
                                    <SelectItem value="customers">
                                        Customers
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Period:{" "}
                                {selectedPeriod === "7days"
                                    ? "Last 7 Days"
                                    : selectedPeriod === "30days"
                                    ? "Last 30 Days"
                                    : "Last 90 Days"}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Insights */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Key Insights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-teal-50 rounded-lg">
                                <div className="text-3xl font-bold text-teal-600 mb-2">
                                    {analyticsData.insights.totalRevenue}
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Total Revenue
                                </p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {analyticsData.insights.totalTransactions}
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Total Transactions
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {analyticsData.insights.uniqueCustomers}
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Unique Customers
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend Analysis */}
                    <Card className="lg:col-span-2 p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                                {selectedMetric.charAt(0).toUpperCase() +
                                    selectedMetric.slice(1)}{" "}
                                Trend
                            </h3>
                        </div>
                        <div className="h-80">
                            <Line
                                data={getTrendData()}
                                options={chartOptions}
                                data-testid="trend-chart"
                            />
                        </div>
                    </Card>

                    {/* Category Distribution */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-teal-600" />
                                Category Performance
                            </h3>
                        </div>
                        <div className="h-80">
                            <Doughnut
                                data={categoryData}
                                options={doughnutOptions}
                                data-testid="category-chart"
                            />
                        </div>
                    </Card>
                </div>

                {/* Best & Least Selling */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Best Selling */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-green-600" />
                                Best Selling Medicines
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {analyticsData.bestSellingMedicines
                                .slice(0, 6)
                                .map((medicine, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                                <span className="text-sm font-bold text-green-600">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {medicine.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {medicine.sales} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(
                                                    medicine.revenue
                                                )}
                                            </p>
                                            <div className="flex items-center text-sm">
                                                {medicine.growth > 0 ? (
                                                    <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                                                )}
                                                <span
                                                    className={
                                                        medicine.growth > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {Math.abs(medicine.growth)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card>

                    {/* Least Selling */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                                Least Selling Medicines
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {analyticsData.leastSellingMedicines.map(
                                (medicine, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {medicine.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {medicine.sales} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(
                                                    medicine.revenue
                                                )}
                                            </p>
                                            <div className="flex items-center text-sm">
                                                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                                                <span className="text-red-600">
                                                    -{Math.abs(medicine.growth)}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                                <span className="font-medium">
                                    💡 Recommendation:
                                </span>{" "}
                                Consider promotional campaigns or stock
                                reduction for these items.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Performance Summary */}
                <Card className="p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-teal-600" />
                            Performance Summary
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-teal-50 rounded-lg">
                            <div className="text-3xl font-bold text-teal-600 mb-2">
                                {
                                    analyticsData.bestSellingMedicines.filter(
                                        (m) => m.growth > 10
                                    ).length
                                }
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                High-Growth Products
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Products with 10% growth
                            </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {
                                    analyticsData.bestSellingMedicines.filter(
                                        (m) => m.growth > 0 && m.growth <= 10
                                    ).length
                                }
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                Stable Products
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Products with 0-10% growth
                            </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                                {
                                    [
                                        ...analyticsData.bestSellingMedicines,
                                        ...analyticsData.leastSellingMedicines,
                                    ].filter((m) => m.growth < 0).length
                                }
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                Declining Products
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Products with negative growth
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
