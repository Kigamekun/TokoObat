<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware([])->group(function () {
    Route::get('/dashboard', function () {
       return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/transactions', fn() => Inertia::render('Transactions'))->name('transactions');
    Route::get('/medicines', fn() => Inertia::render('MedicineCatalog'))->name('medicines');
    Route::get('/reports', fn() => Inertia::render('Reports'))->name('reports');
    Route::get('/history', fn() => Inertia::render('TransactionHistory'))->name('history');
    Route::get('/users', fn() => Inertia::render('UserManagement'))->name('users');
    Route::get('/analytics', fn() => Inertia::render('Analytics'))->name('analytics');
    Route::get('/settings', fn() => Inertia::render('Settings'))->name('settings');
});


require __DIR__.'/auth.php';
