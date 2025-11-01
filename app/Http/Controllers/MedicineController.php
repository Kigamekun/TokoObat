<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

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


    public function stock(Medicine $medicine)
    {
        $medicine->load(['batches' => fn($q) => $q->orderBy('expiration_date')]);

        $totalStock = $medicine->batches->sum('qty');
        $nearest = optional($medicine->batches->where('qty', '>', 0)->sortBy('expiration_date')->first());

        return Inertia::render('MedicineStock', [
            'medicine' => [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'category' => $medicine->category,
                'price' => (float) $medicine->price,
                'minStock' => $medicine->min_stock,
                'unit' => $medicine->unit,
                'totalStock' => $totalStock,
                'nearestExpiry' => $nearest ? $nearest->expiration_date->format('Y-m-d') : null,
            ],
            'batches' => $medicine->batches->map(fn($b) => [
                'id' => $b->id,
                'batchCode' => $b->batch_code,
                'qty' => $b->qty,
                'expirationDate' => optional($b->expiration_date)->format('Y-m-d'),
                'receivedAt' => optional($b->received_at)->format('Y-m-d'),
                'note' => $b->note,
            ]),
        ]);
    }

    public function storeBatch(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'batchCode' => ['nullable', 'string', 'max:100', Rule::unique('medicine_batches', 'batch_code')],
            'qty' => ['required', 'integer', 'min:1'],
            'expirationDate' => ['required', 'date', 'after:today'],
            'receivedAt' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $batch = $medicine->batches()->create([
            'batch_code' => $validated['batchCode'] ?? ('BATCH-' . time()),
            'qty' => $validated['qty'],
            'expiration_date' => $validated['expirationDate'],
            'received_at' => $validated['receivedAt'] ?? now(),
            'note' => $validated['note'] ?? null,
        ]);

        // audit (optional)
        if (class_exists(\App\Models\StockMovement::class)) {
            \App\Models\StockMovement::create([
                'medicine_id' => $medicine->id,
                'medicine_batch_id' => $batch->id,
                'type' => 'in',
                'quantity' => $validated['qty'],
                'ref' => $request->input('ref'),
                'note' => 'Receive new batch',
                'user_id' => optional($request->user())->id,
            ]);
        }

        return back()->with('success', 'Batch added');
    }

    public function updateBatch(Request $request, Medicine $medicine, MedicineBatch $batch)
    {
        abort_unless($batch->medicine_id === $medicine->id, 404);

        $validated = $request->validate([
            'batchCode' => ['nullable', 'string', 'max:100', Rule::unique('medicine_batches', 'batch_code')->ignore($batch->id)],
            'qty' => ['required', 'integer', 'min:0'],
            'expirationDate' => ['required', 'date', 'after:today'],
            'receivedAt' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($batch, $validated, $request, $medicine) {
            $delta = (int) $validated['qty'] - (int) $batch->qty;

            $batch->update([
                'batch_code' => $validated['batchCode'] ?? $batch->batch_code,
                'qty' => $validated['qty'],
                'expiration_date' => $validated['expirationDate'],
                'received_at' => $validated['receivedAt'] ?? $batch->received_at,
                'note' => $validated['note'] ?? $batch->note,
            ]);

            if ($delta !== 0 && class_exists(\App\Models\StockMovement::class)) {
                \App\Models\StockMovement::create([
                    'medicine_id' => $medicine->id,
                    'medicine_batch_id' => $batch->id,
                    'type' => $delta > 0 ? 'in' : 'adjust', // positive as receive; negative recorded as adjust
                    'quantity' => abs($delta),
                    'note' => $delta > 0 ? 'Increase batch qty via edit' : 'Decrease batch qty via edit',
                    'user_id' => optional($request->user())->id,
                ]);
            }
        });

        return back()->with('success', 'Batch updated');
    }

    public function destroyBatch(Medicine $medicine, MedicineBatch $batch)
    {
        abort_unless($batch->medicine_id === $medicine->id, 404);

        if ($batch->qty > 0) {
            return back()->withErrors(['batch' => 'Cannot delete a batch with remaining stock. Issue or adjust to 0 first.']);
        }

        $batch->delete();

        return back()->with('success', 'Batch deleted');
    }

    public function issueStock(Request $request, Medicine $medicine)
    {
        $data = $request->validate([
            'qty' => ['required', 'integer', 'min:1'],
            'ref' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $today = now()->startOfDay();
        $needed = (int) $data['qty'];

        DB::transaction(function () use ($medicine, $today, &$needed, $data, $request) {
            $batches = $medicine->batches()
                ->where('qty', '>', 0)
                ->whereDate('expiration_date', '>=', $today)
                ->orderBy('expiration_date') // FEFO
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($needed <= 0)
                    break;
                $take = min($batch->qty, $needed);
                if ($take <= 0)
                    continue;

                $batch->decrement('qty', $take);

                if (class_exists(\App\Models\StockMovement::class)) {
                    \App\Models\StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'medicine_batch_id' => $batch->id,
                        'type' => 'out',
                        'quantity' => $take,
                        'ref' => $data['ref'] ?? null,
                        'note' => $data['note'] ?? 'FEFO issue',
                        'user_id' => optional($request->user())->id,
                    ]);
                }

                $needed -= $take;
            }

            if ($needed > 0) {
                // Not enough non-expired stock
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []),
                    back()->withErrors(['qty' => 'Not enough non-expired stock. Short by ' . $needed])->getSession()
                );
            }
        });

        return back()->with('success', 'Stock issued (FEFO) successfully');
    }

}
