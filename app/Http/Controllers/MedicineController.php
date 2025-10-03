<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $today = now();
            switch ($request->status) {
                case 'expired':
                    $query->where('expiration_date', '<', $today);
                    break;
                case 'expiring':
                    $query->whereBetween('expiration_date', [$today, $today->copy()->addDays(30)]);
                    break;
                case 'low-stock':
                    $query->whereRaw('stock <= min_stock');
                    break;
                case 'available':
                    $query->where('expiration_date', '>', $today->copy()->addDays(30))
                          ->whereRaw('stock > min_stock');
                    break;
            }
        }

        $medicines = $query->get()->map(function ($medicine) {
            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'category' => $medicine->category,
                'price' => (float) $medicine->price,
                'stock' => $medicine->stock,
                'minStock' => $medicine->min_stock,
                'unit' => $medicine->unit,
                'expirationDate' => $medicine->expiration_date->format('Y-m-d'),
                'description' => $medicine->description,
                'status' => $medicine->status,
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
            'unit' => 'required|in:tablet,capsule,bottle,box,tube,vial',
            'expirationDate' => 'required|date|after:today',
            'description' => 'nullable|string',
        ]);

        Medicine::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'expiration_date' => $validated['expirationDate'],
            'description' => $validated['description'],
        ]);

        return redirect()->route('medicines.index')->with('success', 'Medicine added successfully!');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'minStock' => 'required|integer|min:0',
            'unit' => 'required|in:tablet,capsule,bottle,box,tube,vial',
            'expirationDate' => 'required|date|after:today',
            'description' => 'nullable|string',
        ]);

        $medicine->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'expiration_date' => $validated['expirationDate'],
            'description' => $validated['description'],
        ]);

        return redirect()->route('medicines.index')->with('success', 'Medicine updated successfully!');
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();
        return redirect()->route('medicines.index')->with('success', 'Medicine deleted successfully!');
    }

    public function categories()
    {
        return Medicine::distinct()->pluck('category');
    }
}
