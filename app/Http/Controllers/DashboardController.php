<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Transaction;
use App\Models\TransactionItem;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // === 1) Today & Yesterday sales ===
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Total nilai penjualan hari ini (sum price*quantity dari items yang transaksi-nya dibuat hari ini)
        $todaySalesAmount = (float) TransactionItem::whereHas('transaction', fn($q) =>
                $q->whereDate('created_at', $today)
            )->selectRaw('COALESCE(SUM(price * quantity), 0) as total')
             ->value('total');

        // Jumlah transaksi hari ini
        $todayTransactionsCount = Transaction::whereDate('created_at', $today)->count();

        // Nilai penjualan kemarin (untuk % change)
        $yesterdaySalesAmount = (float) TransactionItem::whereHas('transaction', fn($q) =>
                $q->whereDate('created_at', $yesterday)
            )->selectRaw('COALESCE(SUM(price * quantity), 0) as total')
             ->value('total');

        $salesChange = $yesterdaySalesAmount > 0
            ? round((($todaySalesAmount - $yesterdaySalesAmount) / $yesterdaySalesAmount) * 100, 2)
            : null; // null jika kemarin 0 biar tidak misleading

        // === 2) Medicines summary ===
        $totalMedicines  = Medicine::count();
        $totalCategories = Medicine::distinct('category')->count('category');

        // === 3) Low stock (pakai akumulasi batch) ===
        // Hitung obat yang total qty (SUM di medicine_batches) <= min_stock
        $lowStockCount = Medicine::leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->select('medicines.id', 'medicines.min_stock', DB::raw('COALESCE(SUM(medicine_batches.qty),0) as stock'))
            ->groupBy('medicines.id', 'medicines.min_stock')
            ->havingRaw('COALESCE(SUM(medicine_batches.qty),0) <= medicines.min_stock')
            ->count();

        // === 4) Expiring soon & expired (berdasarkan batch) ===
        $start = Carbon::today();
        $in30  = Carbon::today()->addDays(30);

        // Obat yang punya minimal satu batch expiring dalam 30 hari dan qty>0
        $expiringSoonCount = Medicine::whereHas('batches', function ($q) use ($start, $in30) {
                $q->whereBetween('expiration_date', [$start, $in30])
                  ->where('qty', '>', 0);
            })->count();

        // Obat yang punya minimal satu batch sudah expired dan qty>0
        $expiredCount = Medicine::whereHas('batches', function ($q) use ($start) {
                $q->where('expiration_date', '<', $start)
                  ->where('qty', '>', 0);
            })->count();

        // === 5) Top selling medicines ===
        $topSellingMedicines = TransactionItem::select(
                'medicine_id',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(price * quantity) as total_revenue')
            )
            ->groupBy('medicine_id')
            ->orderByDesc('total_sold')
            ->with(['medicine:id,name,unit'])
            ->limit(5)
            ->get()
            ->map(fn ($i) => [
                'name'    => $i->medicine->name ?? 'Unknown',
                'unit'    => $i->medicine->unit ?? null,
                'sales'   => (int) $i->total_sold,
                'revenue' => (float) $i->total_revenue,
            ]);

        // === 6) Recent transactions ===
        $recentTransactions = Transaction::with(['user:id,name', 'items'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'id'        => $t->id,
                'customer'  => $t->customer_name ?? 'Walk-in Customer',
                'amount'    => (float) $t->items->sum(fn ($i) => $i->price * $i->quantity),
                'items'     => (int) $t->items->count(),
                'time'      => $t->created_at->format('H:i'),
                'cashier'   => $t->user->name ?? 'Unknown',
            ]);

        // === 7) Alerts ===
        $alerts = [];
        if ($lowStockCount > 0) {
            $alerts[] = [
                'type'     => 'low-stock',
                'message'  => "{$lowStockCount} medicines below minimum stock",
                'priority' => 'high',
            ];
        }
        if ($expiringSoonCount > 0) {
            $alerts[] = [
                'type'     => 'expiring',
                'message'  => "{$expiringSoonCount} medicines expiring within 30 days",
                'priority' => 'medium',
            ];
        }
        if ($expiredCount > 0) {
            $alerts[] = [
                'type'     => 'expired',
                'message'  => "{$expiredCount} medicines already expired",
                'priority' => 'high',
            ];
        }

        return Inertia::render('Dashboard', [
            'dashboardData' => [
                'todaySales' => [
                    'amount'        => (float) $todaySalesAmount,
                    'transactions'  => $todayTransactionsCount,
                    'change'        => $salesChange,
                ],
                'totalMedicines' => [
                    'count'      => $totalMedicines,
                    'categories' => $totalCategories,
                ],
                'lowStockAlerts'     => $lowStockCount,
                'expiringSoon'       => $expiringSoonCount,
                'expired'            => $expiredCount,
                'topSellingMedicines'=> $topSellingMedicines,
                'recentTransactions' => $recentTransactions,
                'alerts'             => $alerts,
            ],
        ]);
    }

     public function alerts(Request $request)
    {
        $status   = $request->input('status', 'low-stock'); // low-stock|expiring|expired|all
        $search   = $request->input('search');
        $category = $request->input('category');

        $today = Carbon::today();
        $in30  = Carbon::today()->addDays(30);

        // Base aggregation (total stock + nearest non-empty expiry per medicine)
        $base = Medicine::query()
            ->leftJoin('medicine_batches as b', 'b.medicine_id', '=', 'medicines.id')
            ->select(
                'medicines.id', 'medicines.name', 'medicines.category', 'medicines.min_stock', 'medicines.unit',
                DB::raw('COALESCE(SUM(b.qty),0) as stock'),
                DB::raw("MIN(CASE WHEN b.qty > 0 THEN b.expiration_date END) as nearest_expiration")
            )
            ->groupBy('medicines.id', 'medicines.name', 'medicines.category', 'medicines.min_stock', 'medicines.unit');

        if ($search) {
            $base->where(function ($q) use ($search) {
                $q->where('medicines.name', 'like', "%{$search}%")
                  ->orWhere('medicines.category', 'like', "%{$search}%");
            });
        }
        if ($category && $category !== 'all') {
            $base->where('medicines.category', $category);
        }

        // Status filters — keep logic consistent with dashboard
        if ($status === 'low-stock') {
            $base->havingRaw('COALESCE(SUM(b.qty),0) <= medicines.min_stock');
        } elseif ($status === 'expiring') {
            $base->whereExists(function ($sub) use ($today, $in30) {
                $sub->select(DB::raw(1))
                    ->from('medicine_batches as mb')
                    ->whereColumn('mb.medicine_id', 'medicines.id')
                    ->where('mb.qty', '>', 0)
                    ->whereBetween('mb.expiration_date', [$today, $in30]);
            });
        } elseif ($status === 'expired') {
            $base->whereExists(function ($sub) use ($today) {
                $sub->select(DB::raw(1))
                    ->from('medicine_batches as mb')
                    ->whereColumn('mb.medicine_id', 'medicines.id')
                    ->where('mb.qty', '>', 0)
                    ->where('mb.expiration_date', '<', $today);
            });
        }

        $paginator = $base->orderBy('nearest_expiration', 'asc')
            ->orderBy('medicines.name')
            ->paginate(12)
            ->withQueryString();

        // Counters for tabs
        $lowStockCount = Medicine::leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->select('medicines.id', 'medicines.min_stock', DB::raw('COALESCE(SUM(medicine_batches.qty),0) as stock'))
            ->groupBy('medicines.id', 'medicines.min_stock')
            ->havingRaw('COALESCE(SUM(medicine_batches.qty),0) <= medicines.min_stock')
            ->count();

        $expiringSoonCount = Medicine::whereHas('batches', function ($q) use ($today, $in30) {
                $q->whereBetween('expiration_date', [$today, $in30])
                  ->where('qty', '>', 0);
            })->count();

        $expiredCount = Medicine::whereHas('batches', function ($q) use ($today) {
                $q->where('expiration_date', '<', $today)
                  ->where('qty', '>', 0);
            })->count();

        $categories = Medicine::distinct()->pluck('category');

        // Map data for UI
        $rows = collect($paginator->items())->map(function ($row) {
            return [
                'id'            => (int) $row->id,
                'name'          => $row->name,
                'category'      => $row->category,
                'unit'          => $row->unit,
                'stock'         => (int) $row->stock,
                'minStock'      => (int) $row->min_stock,
                'nearestExpiry' => $row->nearest_expiration ? Carbon::parse($row->nearest_expiration)->format('Y-m-d') : null,
            ];
        });

        return Inertia::render('AlertMedicines', [
            'filters' => [
                'status'   => $status,
                'search'   => $search,
                'category' => $category,
            ],
            'summary' => [
                'lowStock' => $lowStockCount,
                'expiring' => $expiringSoonCount,
                'expired'  => $expiredCount,
            ],
            'categories' => $categories,
            'medicines'  => $rows,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
