<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // === 1. Today's sales ===
        $today = Carbon::today();

        $todayTransactions = Transaction::whereDate('created_at', $today)
            ->with('items')
            ->get();

        $todaySalesAmount = $todayTransactions->sum(function ($t) {
            return $t->items->sum(fn($i) => $i->price * $i->quantity);
        });

        $todayTransactionsCount = $todayTransactions->count();

        // Compare with yesterday for % change
        $yesterday = Carbon::yesterday();
        $yesterdaySalesAmount = Transaction::whereDate('created_at', $yesterday)
            ->with('items')
            ->get()
            ->sum(fn($t) => $t->items->sum(fn($i) => $i->price * $i->quantity));

        $salesChange = $yesterdaySalesAmount > 0
            ? (($todaySalesAmount - $yesterdaySalesAmount) / $yesterdaySalesAmount) * 100
            : 0;

        // === 2. Medicines summary ===
        $totalMedicines = Medicine::count();
        $totalCategories = Medicine::distinct('category')->count('category');

        // === 3. Low stock alerts ===
        $lowStockCount = Medicine::count();

        // === 4. Expiring soon ===
        $expiringSoonCount = Medicine::count();

        // === 5. Top selling medicines ===
        $topSellingMedicines = TransactionItem::select('medicine_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(price * quantity) as total_revenue'))
            ->groupBy('medicine_id')
            ->orderByDesc('total_sold')
            ->with('medicine:id,name')
            ->limit(5)
            ->get()
            ->map(fn($i) => [
                'name' => $i->medicine->name,
                'sales' => $i->total_sold,
                'revenue' => $i->total_revenue,
            ]);

        // === 6. Recent transactions ===
        $recentTransactions = Transaction::with(['user:id,name', 'items'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'customer' => $t->customer_name ?? 'Walk-in Customer',
                'amount' => $t->items->sum(fn($i) => $i->price * $i->quantity),
                'items' => $t->items->count(),
                'time' => $t->created_at->format('h:i A'),
                'cashier' => $t->user->name ?? 'Unknown',
            ]);

        // === 7. Alerts ===
        $alerts = [];

        if ($lowStockCount > 0) {
            $alerts[] = [
                'type' => 'low-stock',
                'message' => "{$lowStockCount} medicines below minimum stock",
                'priority' => 'high',
            ];
        }

        if ($expiringSoonCount > 0) {
            $alerts[] = [
                'type' => 'expiring',
                'message' => "{$expiringSoonCount} medicines expiring within 30 days",
                'priority' => 'medium',
            ];
        }

        // === Pass data to Inertia ===
        return Inertia::render('Dashboard', [
            'dashboardData' => [
                'todaySales' => [
                    'amount' => $todaySalesAmount,
                    'transactions' => $todayTransactionsCount,
                    'change' => round($salesChange, 2),
                ],
                'totalMedicines' => [
                    'count' => $totalMedicines,
                    'categories' => $totalCategories,
                ],
                'lowStockAlerts' => $lowStockCount,
                'expiringSoon' => $expiringSoonCount,
                'topSellingMedicines' => $topSellingMedicines,
                'recentTransactions' => $recentTransactions,
                'alerts' => $alerts,
            ],
        ]);
    }
}
