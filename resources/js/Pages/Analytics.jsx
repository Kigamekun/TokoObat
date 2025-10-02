import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Calendar,
  Award,
  AlertTriangle,
  Star,
  BarChart3
} from 'lucide-react';
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
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Sample analytics data
  const analyticsData = {
    bestSellingMedicines: [
      { name: 'Paracetamol 500mg', sales: 250, revenue: 1250000, growth: 15.2 },
      { name: 'Amoxicillin 250mg', sales: 180, revenue: 2700000, growth: 8.7 },
      { name: 'Vitamin C 1000mg', sales: 165, revenue: 1980000, growth: 22.3 },
      { name: 'Ibuprofen 400mg', sales: 140, revenue: 1120000, growth: -5.1 },
      { name: 'Cetirizine 10mg', sales: 120, revenue: 1200000, growth: 12.8 },
      { name: 'Omeprazole 20mg', sales: 95, revenue: 1710000, growth: 18.4 },
      { name: 'Loratadine 10mg', sales: 88, revenue: 792000, growth: 7.2 },
      { name: 'Metformin 500mg', sales: 75, revenue: 450000, growth: -2.3 }
    ],
    leastSellingMedicines: [
      { name: 'Rare Medicine A', sales: 5, revenue: 250000, growth: -45.2 },
      { name: 'Specialty Drug B', sales: 8, revenue: 400000, growth: -32.1 },
      { name: 'Uncommon Med C', sales: 12, revenue: 180000, growth: -28.7 },
      { name: 'Limited Stock D', sales: 15, revenue: 300000, growth: -15.3 },
      { name: 'Seasonal Med E', sales: 18, revenue: 216000, growth: -12.8 }
    ],
    categoryPerformance: {
      labels: ['Pain Relief', 'Antibiotic', 'Supplement', 'Allergy', 'Gastric', 'Diabetes'],
      datasets: [
        {
          label: 'Revenue (Million IDR)',
          data: [4.2, 3.8, 2.9, 2.1, 1.7, 1.3],
          backgroundColor: [
            '#66b9b6',
            '#4ade80',
            '#60a5fa',
            '#f97316',
            '#8b5cf6',
            '#ec4899'
          ]
        }
      ]
    },
    salesTrend: {
      '7days': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        revenue: [1200000, 1500000, 1800000, 1400000, 2000000, 2500000, 2200000],
        transactions: [45, 52, 68, 48, 72, 89, 76],
        customers: [38, 47, 61, 42, 65, 78, 69]
      },
      '30days': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        revenue: [8500000, 12000000, 9500000, 11000000],
        transactions: [285, 380, 320, 365],
        customers: [245, 335, 278, 312]
      },
      '90days': {
        labels: ['Month 1', 'Month 2', 'Month 3'],
        revenue: [32000000, 41000000, 38000000],
        transactions: [1150, 1420, 1285],
        customers: [985, 1230, 1105]
      }
    },
    insights: [
      {
        type: 'positive',
        title: 'Strong Growth in Supplements',
        description: 'Supplement category shows 22.3% growth, driven by Vitamin C sales.',
        metric: '+22.3%',
        action: 'Consider expanding supplement inventory'
      },
      {
        type: 'negative',
        title: 'Declining Pain Relief Sales',
        description: 'Ibuprofen sales dropped 5.1% this month, investigate market competition.',
        metric: '-5.1%',
        action: 'Review pricing strategy for pain relief medicines'
      },
      {
        type: 'neutral',
        title: 'Stable Antibiotic Demand',
        description: 'Antibiotic category maintains steady 8.7% growth rate.',
        metric: '+8.7%',
        action: 'Maintain current stock levels'
      },
      {
        type: 'warning',
        title: 'Low-performing Products',
        description: '5 medicines have very low sales and may need attention.',
        metric: '5 items',
        action: 'Consider promotional campaigns or stock reduction'
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendData = () => {
    const data = analyticsData.salesTrend[selectedPeriod];
    return {
      labels: data.labels,
      datasets: [
        {
          label: selectedMetric === 'revenue' ? 'Revenue (IDR)' :
                 selectedMetric === 'transactions' ? 'Transactions' : 'Customers',
          data: data[selectedMetric],
          borderColor: '#66b9b6',
          backgroundColor: 'rgba(102, 185, 182, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend Analysis`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (selectedMetric === 'revenue') {
              return formatCurrency(value);
            }
            return value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Revenue by Category'
      }
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <BarChart3 className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <DashboardLayout>
        <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="analytics-title">Analytics & Insights</h1>
          <p className="text-sm text-gray-600 mt-1">
            Deep insights into medicine sales performance and market trends
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger data-testid="analytics-period-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger data-testid="analytics-metric-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              Period: {selectedPeriod === '7days' ? 'Last 7 Days' :
                       selectedPeriod === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </div>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData.insights.map((insight, index) => (
          <Card key={index} className={`p-6 border-l-4 ${getInsightColor(insight.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <Badge className={`${
                    insight.type === 'positive' ? 'bg-green-100 text-green-800' :
                    insight.type === 'negative' ? 'bg-red-100 text-red-800' :
                    insight.type === 'warning' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {insight.metric}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <p className="text-sm font-medium text-gray-800">
                  💡 {insight.action}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
            </h3>
          </div>
          <div className="h-80">
            <Line data={getTrendData()} options={chartOptions} data-testid="trend-chart" />
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
            <Doughnut data={analyticsData.categoryPerformance} options={doughnutOptions} data-testid="category-chart" />
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
            {analyticsData.bestSellingMedicines.slice(0, 6).map((medicine, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(medicine.revenue)}</p>
                  <div className="flex items-center text-sm">
                    {medicine.growth > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={medicine.growth > 0 ? 'text-green-600' : 'text-red-600'}>
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
            {analyticsData.leastSellingMedicines.map((medicine, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(medicine.revenue)}</p>
                  <div className="flex items-center text-sm">
                    <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                    <span className="text-red-600">-{Math.abs(medicine.growth)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <span className="font-medium">💡 Recommendation:</span> Consider promotional campaigns or stock reduction for these items.
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
              {analyticsData.bestSellingMedicines.filter(m => m.growth > 10).length}
            </div>
            <p className="text-sm font-medium text-gray-700">High-Growth Products</p>
            <p className="text-xs text-gray-600 mt-1">Products with 10% growth</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analyticsData.bestSellingMedicines.filter(m => m.growth > 0 && m.growth <= 10).length}
            </div>
            <p className="text-sm font-medium text-gray-700">Stable Products</p>
            <p className="text-xs text-gray-600 mt-1">Products with 0-10% growth</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {[...analyticsData.bestSellingMedicines, ...analyticsData.leastSellingMedicines].filter(m => m.growth < 0).length}
            </div>
            <p className="text-sm font-medium text-gray-700">Declining Products</p>
            <p className="text-xs text-gray-600 mt-1">Products with negative growth</p>
          </div>
        </div>
      </Card>
    </div>

    </DashboardLayout>
  );
};

export default Analytics;
