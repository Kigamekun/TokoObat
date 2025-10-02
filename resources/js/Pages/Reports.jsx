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
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    DollarSign,
    Package,
    Users,
    FileText,
    PieChart,
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
import { Bar, Line, Pie } from "react-chartjs-2";

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

const Reports = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("7days");
    const [selectedReport, setSelectedReport] = useState("sales");

    // Sample data for different time periods
    const reportData = {
        "7days": {
            sales: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Sales (IDR)",
                        data: [
                            120000, 150000, 180000, 140000, 200000, 250000,
                            220000,
                        ],
                        backgroundColor: "rgba(102, 185, 182, 0.5)",
                        borderColor: "rgba(102, 185, 182, 1)",
                        borderWidth: 2,
                    },
                ],
            },
            stock: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Stock In",
                        data: [50, 30, 40, 20, 60, 45, 35],
                        backgroundColor: "rgba(34, 197, 94, 0.5)",
                        borderColor: "rgba(34, 197, 94, 1)",
                        borderWidth: 2,
                    },
                    {
                        label: "Stock Out",
                        data: [45, 55, 35, 50, 40, 65, 50],
                        backgroundColor: "rgba(239, 68, 68, 0.5)",
                        borderColor: "rgba(239, 68, 68, 1)",
                        borderWidth: 2,
                    },
                ],
            },
        },
        "30days": {
            sales: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                    {
                        label: "Sales (IDR)",
                        data: [850000, 1200000, 950000, 1100000],
                        backgroundColor: "rgba(102, 185, 182, 0.5)",
                        borderColor: "rgba(102, 185, 182, 1)",
                        borderWidth: 2,
                    },
                ],
            },
            stock: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                    {
                        label: "Stock In",
                        data: [200, 180, 220, 150],
                        backgroundColor: "rgba(34, 197, 94, 0.5)",
                        borderColor: "rgba(34, 197, 94, 1)",
                        borderWidth: 2,
                    },
                    {
                        label: "Stock Out",
                        data: [180, 200, 190, 170],
                        backgroundColor: "rgba(239, 68, 68, 0.5)",
                        borderColor: "rgba(239, 68, 68, 1)",
                        borderWidth: 2,
                    },
                ],
            },
        },
        "90days": {
            sales: {
                labels: ["Month 1", "Month 2", "Month 3"],
                datasets: [
                    {
                        label: "Sales (IDR)",
                        data: [3200000, 4100000, 3800000],
                        backgroundColor: "rgba(102, 185, 182, 0.5)",
                        borderColor: "rgba(102, 185, 182, 1)",
                        borderWidth: 2,
                    },
                ],
            },
            stock: {
                labels: ["Month 1", "Month 2", "Month 3"],
                datasets: [
                    {
                        label: "Stock In",
                        data: [750, 820, 680],
                        backgroundColor: "rgba(34, 197, 94, 0.5)",
                        borderColor: "rgba(34, 197, 94, 1)",
                        borderWidth: 2,
                    },
                    {
                        label: "Stock Out",
                        data: [720, 780, 650],
                        backgroundColor: "rgba(239, 68, 68, 0.5)",
                        borderColor: "rgba(239, 68, 68, 1)",
                        borderWidth: 2,
                    },
                ],
            },
        },
    };

    // Medicine category distribution data
    const categoryData = {
        labels: [
            "Pain Relief",
            "Antibiotic",
            "Supplement",
            "Allergy",
            "Gastric",
            "Diabetes",
        ],
        datasets: [
            {
                data: [25, 20, 18, 15, 12, 10],
                backgroundColor: [
                    "#66b9b6",
                    "#4ade80",
                    "#60a5fa",
                    "#f97316",
                    "#8b5cf6",
                    "#ec4899",
                ],
                borderWidth: 0,
            },
        ],
    };

    // Summary statistics
    const summaryStats = {
        "7days": {
            totalSales: 1260000,
            transactions: 89,
            averageTransaction: 14157,
            topMedicine: "Paracetamol 500mg",
        },
        "30days": {
            totalSales: 4100000,
            transactions: 312,
            averageTransaction: 13141,
            topMedicine: "Amoxicillin 250mg",
        },
        "90days": {
            totalSales: 11100000,
            transactions: 856,
            averageTransaction: 12967,
            topMedicine: "Vitamin C 1000mg",
        },
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text:
                    selectedReport === "sales"
                        ? "Sales Report"
                        : "Stock Movement Report",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "right",
            },
            title: {
                display: true,
                text: "Medicine Categories Distribution",
            },
        },
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getPeriodLabel = (period) => {
        switch (period) {
            case "7days":
                return "Last 7 Days";
            case "30days":
                return "Last 30 Days";
            case "90days":
                return "Last 90 Days";
            default:
                return "Last 7 Days";
        }
    };

    const handleExportReport = () => {
        // Mock export functionality
        const data = {
            period: getPeriodLabel(selectedPeriod),
            reportType: selectedReport,
            generatedAt: new Date().toISOString(),
            stats: summaryStats[selectedPeriod],
            chartData: reportData[selectedPeriod][selectedReport],
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReport}-report-${selectedPeriod}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-3xl font-bold text-gray-900"
                            data-testid="reports-title"
                        >
                            Sales & Stock Reports
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Analyze your pharmacy's performance with detailed
                            reports and charts
                        </p>
                    </div>
                    <Button
                        onClick={handleExportReport}
                        className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700"
                        data-testid="export-report-button"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
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
                                <SelectTrigger data-testid="period-select">
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
                                Report Type
                            </label>
                            <Select
                                value={selectedReport}
                                onValueChange={setSelectedReport}
                            >
                                <SelectTrigger data-testid="report-type-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sales">
                                        Sales Report
                                    </SelectItem>
                                    <SelectItem value="stock">
                                        Stock Movement
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Report Period: {getPeriodLabel(selectedPeriod)}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(
                                        summaryStats[selectedPeriod].totalSales
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-full">
                                <DollarSign className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Transactions
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {summaryStats[selectedPeriod].transactions}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Avg Transaction
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(
                                        summaryStats[selectedPeriod]
                                            .averageTransaction
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Top Medicine
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    {summaryStats[selectedPeriod].topMedicine}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <Card className="lg:col-span-2 p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                                {selectedReport === "sales"
                                    ? "Sales Trend"
                                    : "Stock Movement"}
                            </h3>
                        </div>
                        <div className="h-80">
                            {selectedReport === "sales" ? (
                                <Line
                                    data={
                                        reportData[selectedPeriod][
                                            selectedReport
                                        ]
                                    }
                                    options={chartOptions}
                                    data-testid="sales-chart"
                                />
                            ) : (
                                <Bar
                                    data={
                                        reportData[selectedPeriod][
                                            selectedReport
                                        ]
                                    }
                                    options={chartOptions}
                                    data-testid="stock-chart"
                                />
                            )}
                        </div>
                    </Card>

                    {/* Category Distribution */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <PieChart className="w-5 h-5 mr-2 text-teal-600" />
                                Medicine Categories
                            </h3>
                        </div>
                        <div className="h-80">
                            <Pie
                                data={categoryData}
                                options={pieOptions}
                                data-testid="category-chart"
                            />
                        </div>
                    </Card>
                </div>

                {/* Detailed Reports Table */}
                <Card className="p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Detailed Report Data
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {selectedReport === "sales"
                                            ? "Sales Amount"
                                            : "Stock In"}
                                    </th>
                                    {selectedReport === "stock" && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock Out
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Growth
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData[selectedPeriod][
                                    selectedReport
                                ].labels.map((label, index) => {
                                    const currentValue =
                                        reportData[selectedPeriod][
                                            selectedReport
                                        ].datasets[0].data[index];
                                    const previousValue =
                                        index > 0
                                            ? reportData[selectedPeriod][
                                                  selectedReport
                                              ].datasets[0].data[index - 1]
                                            : currentValue;
                                    const growth =
                                        previousValue > 0
                                            ? (
                                                  ((currentValue -
                                                      previousValue) /
                                                      previousValue) *
                                                  100
                                              ).toFixed(1)
                                            : 0;

                                    return (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {label}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {selectedReport === "sales"
                                                    ? formatCurrency(
                                                          currentValue
                                                      )
                                                    : `${currentValue} units`}
                                            </td>
                                            {selectedReport === "stock" && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {
                                                        reportData[
                                                            selectedPeriod
                                                        ][selectedReport]
                                                            .datasets[1].data[
                                                            index
                                                        ]
                                                    }{" "}
                                                    units
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        growth >= 0
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {growth >= 0 ? "+" : ""}
                                                    {growth}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
