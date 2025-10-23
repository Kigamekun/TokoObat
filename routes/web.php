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

Route::get('/beranda', function () {
    $featuredMedicines = Medicine::orderBy('created_at', 'desc')->take(6)->get();
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


// Route::get('/katalog', function () {
//     return Inertia::render('Katalog');
// });

Route::get('/checkout', function () {
    return Inertia::render('Checkout', );
});


// Route publik untuk checkout (guest)
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

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



Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    

  


    // Medicines
    Route::resource('medicines', MedicineController::class);

    // Transactions
    Route::resource('transactions', TransactionController::class);

    // Users
    Route::resource('users', UserController::class);
    Route::resource('reports', \App\Http\Controllers\ReportsController::class)->only(['index']);
    Route::resource('analytics', \App\Http\Controllers\AnalyticsController::class)->only(['index']);
    Route::get('/history', [TransactionController::class, 'history'])->name('history');
});

// Route::middleware(['auth'])->group(function () {
//     Route::get('/dashboard', function () {
//        return Inertia::render('Dashboard');
//     })->name('dashboard');
//     Route::get('/transactions', fn() => Inertia::render('Transactions'))->name('transactions');
//     Route::get('/medicines', fn() => Inertia::render('MedicineCatalog'))->name('medicines');
//     Route::get('/reports', fn() => Inertia::render('Reports'))->name('reports');
//     Route::get('/history', fn() => Inertia::render('TransactionHistory'))->name('history');
//     Route::get('/users', fn() => Inertia::render('UserManagement'))->name('users');
//     Route::get('/analytics', fn() => Inertia::render('Analytics'))->name('analytics');
//     Route::get('/settings', fn() => Inertia::render('Settings'))->name('settings');
// });




require __DIR__ . '/auth.php';
