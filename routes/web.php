<?php

use App\Http\Controllers\KatalogController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Medicine;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\AnalyticsController;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;


Route::get('/', function () {
    $today = Carbon::today()->toDateString();

    $featuredMedicines = Medicine::query()
        ->leftJoin('medicine_batches as b', function ($join) use ($today) {
            $join->on('b.medicine_id', '=', 'medicines.id')
                ->whereDate('b.expiration_date', '>=', $today); // hanya batch non-expired
        })
        ->select(
            'medicines.id',
            'medicines.name',
            'medicines.category',
            'medicines.price',
            'medicines.description',
            'medicines.img',
            DB::raw('COALESCE(SUM(b.qty), 0) as stock')
        )
        ->groupBy('medicines.id', 'medicines.name', 'medicines.category', 'medicines.price', 'medicines.description', 'medicines.img')
        ->orderByDesc('medicines.created_at')
        ->take(6)
        ->get();

    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'featuredMedicines' => $featuredMedicines,
    ]);
});

Route::get('/katalogobat', function () {
    $medicines = Medicine::select('id', 'name', 'price', 'stock', 'category', 'description', 'img')->get();
    $categories = Medicine::select('category')->distinct()->pluck('category');

    return Inertia::render('Katalog', [
        'medicines' => $medicines,
        'categories' => $categories,
    ]);
});

Route::get('/katalogobat', function () {
    $today = Carbon::today()->toDateString();

    // Ambil stok tersedia (non-expired) per obat
    $medicines = Medicine::query()
        ->leftJoin('medicine_batches as b', function ($join) use ($today) {
            $join->on('b.medicine_id', '=', 'medicines.id')
                ->whereDate('b.expiration_date', '>=', $today);
        })
        ->select(
            'medicines.id',
            'medicines.name',
            'medicines.price',
            'medicines.category',
            'medicines.description',
            'medicines.img',
            DB::raw('COALESCE(SUM(b.qty), 0) as stock')
        )
        ->groupBy('medicines.id', 'medicines.name', 'medicines.price', 'medicines.category', 'medicines.description', 'medicines.img')
        ->get();

    $categories = Medicine::select('category')->distinct()->pluck('category');

    return Inertia::render('Katalog', [
        'medicines' => $medicines,
        'categories' => $categories,
    ]);
});

Route::get('/checkout', function () {
    return Inertia::render('Checkout', );
});

Route::get('/checkout/{transaction_code}', [CheckoutController::class, 'show']);

Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');



Route::patch('/transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('transactions.updateStatus');

Route::get('/cart', function () {
    return Inertia::render('Cart', );
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/alerts', [DashboardController::class, 'alerts'])->name('alerts');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('medicines', MedicineController::class);

    Route::get('/medicines/{medicine}/stock', [MedicineController::class, 'stock'])
        ->name('medicines.stock');

    Route::post('/medicines/{medicine}/batches', [MedicineController::class, 'storeBatch'])
        ->name('batches.store');
    Route::put('/medicines/{medicine}/batches/{batch}', [MedicineController::class, 'updateBatch'])
        ->name('batches.update');
    Route::delete('/medicines/{medicine}/batches/{batch}', [MedicineController::class, 'destroyBatch'])
        ->name('batches.destroy');

    Route::post('/medicines/{medicine}/issue', [MedicineController::class, 'issueStock'])
        ->name('stock.issue');


    Route::resource('transactions', TransactionController::class);

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);



    Route::resource('reports', ReportsController::class)->only(['index']);
    Route::resource('analytics', AnalyticsController::class)->only(['index']);
    Route::get('/history', [TransactionController::class, 'history'])->name('history');
});

require __DIR__ . '/auth.php';
