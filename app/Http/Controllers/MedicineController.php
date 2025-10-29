<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

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
                'img' => $medicine->img ? asset($medicine->img) : null,
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
            'img' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'expirationDate' => 'required|date|after:today',
            'description' => 'nullable|string',
        ]);

        // Upload file ke public/assets/medicines
        $imgPath = null;
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $destination = public_path('assets/medicines');
            $file->move($destination, $filename);
            $imgPath = 'assets/medicines/' . $filename; // path relatif
        }

        Medicine::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'img' => $imgPath,
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
            'img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'expirationDate' => 'required|date|after:today',
            'description' => 'nullable|string',
        ]);

        // Jika user upload gambar baru
        if ($request->hasFile('img')) {
            // Hapus gambar lama kalau ada
            if ($medicine->img && File::exists(public_path($medicine->img))) {
                File::delete(public_path($medicine->img));
            }

            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $destination = public_path('assets/medicines');
            $file->move($destination, $filename);
            $medicine->img = 'assets/medicines/' . $filename;
        }

        $medicine->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'expiration_date' => $validated['expirationDate'],
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

        $medicine->delete();
        return redirect()->route('medicines.index')->with('success', 'Medicine deleted successfully!');
    }

    public function categories()
    {
        return Medicine::distinct()->pluck('category');
    }
}
