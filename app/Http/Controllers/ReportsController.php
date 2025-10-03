<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '7days');

        $reports = [
            'last7Days' => $this->getLast7DaysData(),
            'last30Days' => $this->getLast30DaysData(),
            'last90Days' => $this->getLast90DaysData(),
        ];

        $categories = Medicine::select('category')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->category,
                    'count' => $item->count
                ];
            });

        return Inertia::render('Reports', [
            'reports' => $reports,
            'categories' => $categories,
        ]);
    }

    private function getLast7DaysData()
    {
        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        return $this->getReportData($startDate, $endDate, 'day');
    }

    private function getLast30DaysData()
    {
        $startDate = Carbon::now()->subDays(29)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        return $this->getReportData($startDate, $endDate, 'week');
    }

    private function getLast90DaysData()
    {
        $startDate = Carbon::now()->subDays(89)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        return $this->getReportData($startDate, $endDate, 'month');
    }

    private function getReportData($startDate, $endDate, $groupBy)
    {
        // Sales Data
        $salesData = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total_sales'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Stock Movement Data (from transaction items)
        $stockOutData = TransactionItem::whereHas('transaction', function($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->select(
                DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('SUM(transaction_items.quantity) as total_quantity')
            )
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Format data based on grouping
        if ($groupBy === 'day') {
            $salesFormatted = $this->formatDailyData($salesData, $startDate, $endDate);
            $stockFormatted = $this->formatDailyStockData($stockOutData, $startDate, $endDate);
        } elseif ($groupBy === 'week') {
            $salesFormatted = $this->formatWeeklyData($salesData);
            $stockFormatted = $this->formatWeeklyStockData($stockOutData);
        } else {
            $salesFormatted = $this->formatMonthlyData($salesData);
            $stockFormatted = $this->formatMonthlyStockData($stockOutData);
        }

        // Top selling medicine
        $topMedicine = TransactionItem::whereHas('transaction', function($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->select(
                'medicines.name',
                DB::raw('SUM(transaction_items.quantity) as total_sold'),
                DB::raw('SUM(transaction_items.quantity * transaction_items.price) as total_revenue')
            )
            ->join('medicines', 'transaction_items.medicine_id', '=', 'medicines.id')
            ->groupBy('medicines.id', 'medicines.name')
            ->orderByDesc('total_sold')
            ->first();

        return [
            'salesData' => $salesFormatted['sales_data'],
            'stockOutData' => $stockFormatted['stock_out_data'],
            'stockInData' => $stockFormatted['stock_in_data'], // You might want to add stock in data from another source
            'totalSales' => $salesData->sum('total_sales'),
            'totalTransactions' => $salesData->sum('transaction_count'),
            'averageTransaction' => $salesData->avg('total_sales'),
            'topMedicine' => $topMedicine ? $topMedicine->name : 'No data',
            'labels' => $salesFormatted['labels'],
        ];
    }

    private function formatDailyData($salesData, $startDate, $endDate)
    {
        $labels = [];
        $sales = [];
        $currentDate = $startDate->copy();

        // Initialize all days with 0
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $labels[] = $currentDate->format('D');
            $sales[$dateStr] = 0;
            $currentDate->addDay();
        }

        // Fill with actual data
        foreach ($salesData as $data) {
            $dateStr = $data->date;
            $sales[$dateStr] = (float) $data->total_sales;
        }

        return [
            'labels' => $labels,
            'sales_data' => array_values($sales),
        ];
    }

    private function formatDailyStockData($stockData, $startDate, $endDate)
    {
        $labels = [];
        $stockOut = [];
        $stockIn = []; // You can modify this to get actual stock in data
        $currentDate = $startDate->copy();

        // Initialize all days with 0
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $labels[] = $currentDate->format('D');
            $stockOut[$dateStr] = 0;
            $stockIn[$dateStr] = rand(20, 60); // Mock data for stock in
            $currentDate->addDay();
        }

        // Fill with actual data
        foreach ($stockData as $data) {
            $dateStr = $data->date;
            $stockOut[$dateStr] = (int) $data->total_quantity;
        }

        return [
            'labels' => $labels,
            'stock_out_data' => array_values($stockOut),
            'stock_in_data' => array_values($stockIn),
        ];
    }

    private function formatWeeklyData($salesData)
    {
        $weeklyData = [];

        foreach ($salesData as $data) {
            $week = Carbon::parse($data->date)->weekOfYear;
            if (!isset($weeklyData[$week])) {
                $weeklyData[$week] = 0;
            }
            $weeklyData[$week] += (float) $data->total_sales;
        }

        $labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        $sales = array_pad(array_values($weeklyData), 4, 0);

        return [
            'labels' => $labels,
            'sales_data' => $sales,
        ];
    }

    private function formatWeeklyStockData($stockData)
    {
        $weeklyStockOut = [];
        $weeklyStockIn = [];

        foreach ($stockData as $data) {
            $week = Carbon::parse($data->date)->weekOfYear;
            if (!isset($weeklyStockOut[$week])) {
                $weeklyStockOut[$week] = 0;
                $weeklyStockIn[$week] = rand(150, 250); // Mock data
            }
            $weeklyStockOut[$week] += (int) $data->total_quantity;
        }

        $labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        $stockOut = array_pad(array_values($weeklyStockOut), 4, 0);
        $stockIn = array_pad(array_values($weeklyStockIn), 4, 0);

        return [
            'labels' => $labels,
            'stock_out_data' => $stockOut,
            'stock_in_data' => $stockIn,
        ];
    }

    private function formatMonthlyData($salesData)
    {
        $monthlyData = [];

        foreach ($salesData as $data) {
            $month = Carbon::parse($data->date)->month;
            if (!isset($monthlyData[$month])) {
                $monthlyData[$month] = 0;
            }
            $monthlyData[$month] += (float) $data->total_sales;
        }

        $labels = ['Month 1', 'Month 2', 'Month 3'];
        $sales = array_pad(array_values($monthlyData), 3, 0);

        return [
            'labels' => $labels,
            'sales_data' => $sales,
        ];
    }

    private function formatMonthlyStockData($stockData)
    {
        $monthlyStockOut = [];
        $monthlyStockIn = [];

        foreach ($stockData as $data) {
            $month = Carbon::parse($data->date)->month;
            if (!isset($monthlyStockOut[$month])) {
                $monthlyStockOut[$month] = 0;
                $monthlyStockIn[$month] = rand(600, 900); // Mock data
            }
            $monthlyStockOut[$month] += (int) $data->total_quantity;
        }

        $labels = ['Month 1', 'Month 2', 'Month 3'];
        $stockOut = array_pad(array_values($monthlyStockOut), 3, 0);
        $stockIn = array_pad(array_values($monthlyStockIn), 3, 0);

        return [
            'labels' => $labels,
            'stock_out_data' => $stockOut,
            'stock_in_data' => $stockIn,
        ];
    }

    public function export(Request $request)
    {
        $period = $request->get('period', '7days');
        $reportType = $request->get('type', 'sales');

        $data = $this->getExportData($period, $reportType);

        return response()->json($data);
    }

    private function getExportData($period, $reportType)
    {
        // Implement export data logic here
        return [
            'period' => $period,
            'type' => $reportType,
            'data' => [],
            'generated_at' => now()->toISOString(),
        ];
    }
}
