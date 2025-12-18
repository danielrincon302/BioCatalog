<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get current user profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['company', 'role']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update current user profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'mobile' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'avatar_url' => 'nullable|string|max:500',
        ]);

        $user->update($validated);
        $user->load(['company', 'role']);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Update current user password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
                'errors' => [
                    'current_password' => ['Current password is incorrect'],
                ],
            ], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }
}
