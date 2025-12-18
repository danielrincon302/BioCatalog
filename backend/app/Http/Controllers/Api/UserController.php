<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = User::with(['company', 'role']);

        // Super Admin sees all users
        // Admin only sees users from their company
        // Editor only sees themselves
        if ($user->isEditor()) {
            $query->where('id', $user->id);
        } elseif ($user->isAdmin()) {
            $query->where('id_company', $user->id_company);
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Verify permissions
        if ($user->isEditor()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create users',
            ], 403);
        }

        $rules = [
            'name' => 'required|string|max:200',
            'email' => 'required|string|max:150|unique:users',
            'password' => 'required|string|min:6',
            'mobile' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'id_role' => 'required|exists:roles,id',
        ];

        // Super Admin can assign any company
        if ($user->isSuperAdmin()) {
            $rules['id_company'] = 'required|exists:companies,id';
        }

        $validated = $request->validate($rules);

        // Admin can only create editors in their company
        if ($user->isAdmin()) {
            if ($validated['id_role'] != Role::EDITOR) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only create users with Editor role',
                ], 403);
            }
            $validated['id_company'] = $user->id_company;
        }

        $validated['password'] = Hash::make($validated['password']);

        $newUser = User::create($validated);

        return response()->json([
            'success' => true,
            'data' => $newUser->load(['company', 'role']),
            'message' => 'User created successfully',
        ], 201);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Verify view permissions
        if ($currentUser->isEditor() && $currentUser->id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this user',
            ], 403);
        }

        if ($currentUser->isAdmin() && $currentUser->id_company !== $user->id_company) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this user',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $user->load(['company', 'role']),
        ]);
    }

    public function update(Request $request, User $userToEdit): JsonResponse
    {
        $user = $request->user();

        // Editors can only edit themselves
        if ($user->isEditor() && $user->id !== $userToEdit->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this user',
            ], 403);
        }

        // Admins can only edit users from their company, but NOT Super Admins
        if ($user->isAdmin()) {
            if ($user->id_company !== $userToEdit->id_company || $userToEdit->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to edit this user',
                ], 403);
            }
        }

        $rules = [
            'name' => 'sometimes|required|string|max:200',
            'email' => 'sometimes|required|string|max:150|unique:users,email,' . $userToEdit->id,
            'mobile' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'active' => 'sometimes|boolean',
        ];

        // Only Super Admin can change role and company
        if ($user->isSuperAdmin()) {
            $rules['id_role'] = 'sometimes|exists:roles,id';
            $rules['id_company'] = 'sometimes|exists:companies,id';
        }

        if ($request->has('password') && $request->password) {
            $rules['password'] = 'string|min:6';
        }

        $validated = $request->validate($rules);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $userToEdit->update($validated);

        return response()->json([
            'success' => true,
            'data' => $userToEdit->load(['company', 'role']),
            'message' => 'User updated successfully',
        ]);
    }

    public function destroy(Request $request, User $userToDelete): JsonResponse
    {
        $user = $request->user();

        // Cannot delete yourself
        if ($user->id === $userToDelete->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete yourself',
            ], 403);
        }

        // Editors cannot delete anyone
        if ($user->isEditor()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete users',
            ], 403);
        }

        // Admins can only delete users from their company, but NOT Super Admins or other Admins
        if ($user->isAdmin()) {
            if ($user->id_company !== $userToDelete->id_company ||
                $userToDelete->isSuperAdmin() ||
                $userToDelete->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete this user',
                ], 403);
            }
        }

        $userToDelete->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}
