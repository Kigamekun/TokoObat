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
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
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
        'medicines'  => $medicines,
        'categories' => $categories,
    ]);
});




// Route::get('/katalog', function () {
//     return Inertia::render('Katalog');
// });

Route::get('/checkout', function () {
    return Inertia::render('Checkout', );
});

Route::get('/checkout/{transaction_code}', [CheckoutController::class, 'show']);

// Route publik untuk checkout (guest)
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');



Route::patch('/transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('transactions.updateStatus');

// Untuk dashboard admin (lihat & kelola obat)
// Route::get('/medicines', [KatalogController::class, 'index'])->name('medicines.index');
// Route::get('/medicines/{id}/edit', [KatalogController::class, 'edit'])->name('medicines.edit');
// Route::put('/medicines/{id}', [KatalogController::class, 'update'])->name('medicines.update');
// Route::delete('/medicines/{id}', [KatalogController::class, 'destroy'])->name('medicines.destroy');


Route::get('/cart', function () {
    return Inertia::render('Cart', );
});


// Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
// Route::post('/cart/add/{id}', [CartController::class, 'add'])->name('cart.add');
// Route::post('/cart/update/{id}', [CartController::class, 'update'])->name('cart.update');
// Route::post('/cart/remove/{id}', [CartController::class, 'remove'])->name('cart.remove');
// Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');


// Route::get('/dashboard', function () {
//      return Inertia::render('Dashboard');
//  })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


});

Route::get('/alerts', [DashboardController::class, 'alerts'])->name('alerts');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');






    // Medicines
    Route::resource('medicines', MedicineController::class);

    Route::get('/medicines/{medicine}/stock', [MedicineController::class, 'stock'])
    ->name('medicines.stock');

    // Batch CRUD
    Route::post('/medicines/{medicine}/batches', [MedicineController::class, 'storeBatch'])
    ->name('batches.store');
    Route::put('/medicines/{medicine}/batches/{batch}', [MedicineController::class, 'updateBatch'])
    ->name('batches.update');
    Route::delete('/medicines/{medicine}/batches/{batch}', [MedicineController::class, 'destroyBatch'])
    ->name('batches.destroy');

    // FEFO issue (consume)
    Route::post('/medicines/{medicine}/issue', [MedicineController::class, 'issueStock'])
    ->name('stock.issue');



    // Transactions
    Route::resource('transactions', TransactionController::class);

    // Users
    Route::resource('users', UserController::class);
    Route::resource('reports', \App\Http\Controllers\ReportsController::class)->only(['index']);
    Route::resource('analytics', \App\Http\Controllers\AnalyticsController::class)->only(['index']);
    Route::get('/history', [TransactionController::class, 'history'])->name('history');
});

require __DIR__ . '/auth.php';
