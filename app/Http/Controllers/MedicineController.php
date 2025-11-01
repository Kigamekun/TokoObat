<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::with('batches');

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        // Category filter
        if ($request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Status filter
        if ($request->status && $request->status !== 'all') {
            $today = now();

            $query->whereHas('batches', function ($q) use ($request, $today) {
                if ($request->status === 'expired') {
                    $q->where('expiration_date', '<', $today);
                } elseif ($request->status === 'expiring') {
                    $q->whereBetween('expiration_date', [$today, $today->copy()->addDays(30)]);
                } elseif ($request->status === 'low-stock') {
                    $q->groupBy('medicine_id')
                        ->havingRaw('SUM(qty) <= MIN(min_stock)');
                } elseif ($request->status === 'available') {
                    $q->where('expiration_date', '>', $today->copy()->addDays(30));
                }
            });
        }

        $medicines = $query->get()->map(function ($medicine) {
            $totalStock = $medicine->batches->sum('qty');

            // nearest expiration
            $nearestBatch = $medicine->batches->sortBy('expiration_date')->first();
            $expirationDate = $nearestBatch ? $nearestBatch->expiration_date : '-';

            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'category' => $medicine->category,
                'price' => (float) $medicine->price,
                'stock' => $totalStock,
                'minStock' => $medicine->min_stock,
                'unit' => $medicine->unit,
                'img' => $medicine->img ? asset($medicine->img) : null,
                'expirationDate' => $expirationDate,

                // Kirim batch untuk modal stok
                'batches' => $medicine->batches->map(function ($batch) {
                    return [
                        'id' => $batch->id,
                        'batchCode' => $batch->batch_code,
                        'qty' => $batch->qty,
                        'expirationDate' => $batch->expiration_date,
                    ];
                }),

                'description' => $medicine->description,
                'lastUpdated' => $medicine->updated_at->format('Y-m-d'),
            ];
        });

        $categories = Medicine::distinct()->pluck('category');

        return Inertia::render('MedicineCatalog', [
            'medicines' => $medicines,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'minStock' => 'required|integer|min:0',
            'unit' => 'required|string',
            'img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'expirationDate' => 'required|date|after:today',
            'description' => 'nullable|string',
        ]);

        $imgPath = null;
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets/medicines'), $filename);
            $imgPath = 'assets/medicines/' . $filename;
        }

        $medicine = Medicine::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'img' => $imgPath,
            'description' => $validated['description'],
        ]);

        MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_code' => 'BATCH-' . time(),
            'qty' => $validated['stock'],
            'expiration_date' => $validated['expirationDate'],
        ]);

        return redirect()->route('medicines.index')->with('success', 'Medicine added successfully!');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'minStock' => 'required|integer|min:0',
            'unit' => 'required|string',
            'img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('img')) {
            if ($medicine->img && File::exists(public_path($medicine->img))) {
                File::delete(public_path($medicine->img));
            }

            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets/medicines'), $filename);
            $medicine->img = 'assets/medicines/' . $filename;
        }

        $medicine->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'description' => $validated['description'],
            'img' => $medicine->img,
        ]);

        return redirect()->route('medicines.index')->with('success', 'Medicine updated successfully!');
    }

    public function destroy(Medicine $medicine)
    {
        if ($medicine->img && File::exists(public_path($medicine->img))) {
            File::delete(public_path($medicine->img));
        }

        $medicine->batches()->delete();
        $medicine->delete();

        return redirect()->route('medicines.index')->with('success', 'Medicine deleted successfully!');
    }

    public function categories()
    {
        return Medicine::distinct()->pluck('category');
    }
}
