<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '30days');
        $dateRange = $this->getDateRange($period);

        // 🔹 Cache hasil analytics supaya nggak bikin lag
        $analytics = Cache::remember("analytics_$period", 600, function () use ($dateRange) {
            return [
                'insights' => $this->generateInsights($dateRange),
                'bestSellingMedicines' => $this->getBestSellingMedicines($dateRange),
                'leastSellingMedicines' => $this->getLeastSellingMedicines($dateRange),
                'categoryPerformance' => $this->getCategoryPerformance($dateRange),
                'salesTrend' => $this->getSalesTrend($dateRange),
            ];
        });


        // 🔹 Render pakai Inertia, kirim data ke React/Vue
        return Inertia::render('Analytics', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }



    private function generateInsights($dateRange)
    {
        $transactions = Transaction::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        return [
            'totalRevenue' => $transactions->sum('total'),
            'totalTransactions' => $transactions->count(),
            'uniqueCustomers' => $transactions->distinct('customer_phone')->count('customer_phone'),
        ];
    }

    private function getBestSellingMedicines($dateRange)
    {
        return TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('medicines', 'transaction_items.medicine_id', '=', 'medicines.id')
            ->whereBetween('transactions.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'medicines.id',
                'medicines.name',
                DB::raw('SUM(transaction_items.quantity) as sales'),
                DB::raw('SUM(transaction_items.quantity * transaction_items.price) as revenue')
            )
            ->groupBy('medicines.id', 'medicines.name')
            ->orderByDesc('sales')
            ->limit(5)
            ->get();
    }

    private function getLeastSellingMedicines($dateRange)
    {
        return TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('medicines', 'transaction_items.medicine_id', '=', 'medicines.id')
            ->whereBetween('transactions.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'medicines.id',
                'medicines.name',
                DB::raw('SUM(transaction_items.quantity) as sales'),
                DB::raw('SUM(transaction_items.quantity * transaction_items.price) as revenue')
            )
            ->groupBy('medicines.id', 'medicines.name')
            ->orderBy('sales')
            ->limit(5)
            ->get();
    }

    private function getCategoryPerformance($dateRange)
    {
        return TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('medicines', 'transaction_items.medicine_id', '=', 'medicines.id')
            ->whereBetween('transactions.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'medicines.category',
                DB::raw('SUM(transaction_items.quantity) as total_sales'),
                DB::raw('SUM(transaction_items.quantity * transaction_items.price) as revenue')
            )
            ->groupBy('medicines.category')
            ->orderByDesc('revenue')
            ->get();
    }

    private function getSalesTrend($dateRange)
    {
        $salesTrend = Transaction::select(
            DB::raw("DATE(created_at) as date"),
            DB::raw("SUM(total) as total")
        )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $salesTrend->isEmpty()
            ? ['labels' => [], 'values' => []]
            : [
                'labels' => $salesTrend->pluck('date'),
                'values' => $salesTrend->pluck('total'),
            ];
    }

    private function getDateRange($period)
    {
        $end = now();
        switch ($period) {
            case '7days':
                $start = now()->subDays(7);
                break;
            case '90days':
                $start = now()->subDays(90);
                break;
            default:
                $start = now()->subDays(30);
                break;
        }

        return [
            'start' => $start->startOfDay(),
            'end' => $end->endOfDay(),
        ];
    }
}
