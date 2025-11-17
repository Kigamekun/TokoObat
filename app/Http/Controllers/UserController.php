<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $users = $query->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('UserManagement', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'role'   => $request->get('role', 'all'),
                'status' => $request->get('status', 'all'),
            ],
            'roles' => ['admin', 'staff'], // sesuaikan dengan kebutuhanmu
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:50'],
            'role'     => ['required', 'string'],
            'status'   => ['required', 'in:active,inactive'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'    => ['nullable', 'string', 'max:50'],
            'role'     => ['required', 'string'],
            'status'   => ['required', 'in:active,inactive'],
            'password' => ['nullable', 'confirmed', 'min:6'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user' => $user->fresh(),
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $user->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'user' => $user->fresh(),
        ]);
    }
}
