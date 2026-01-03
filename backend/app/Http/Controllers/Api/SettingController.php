<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /**
     * Get all settings (public endpoint)
     */
    public function index(): JsonResponse
    {
        $settings = Setting::getAllAsArray();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update settings (protected - ADMIN/SUPER_ADMIN only)
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update settings',
            ], 403);
        }

        $validated = $request->validate([
            'catalog_title' => 'nullable|string|max:200',
            'catalog_title_en' => 'nullable|string|max:200',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'text');
            }
        }

        return response()->json([
            'success' => true,
            'data' => Setting::getAllAsArray(),
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Upload image (favicon or logo)
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to upload images',
            ], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:favicon,logo',
            'image' => 'required|image|mimes:ico,png,gif,svg,jpeg,jpg,webp|max:2048',
        ]);

        $type = $validated['type'];
        $file = $request->file('image');

        // Storage path for settings images
        $storagePath = 'public/settings';
        if (!Storage::exists($storagePath)) {
            Storage::makeDirectory($storagePath);
        }

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = sprintf(
            '%s_%s_%s.%s',
            $type,
            now()->format('YmdHis'),
            Str::random(8),
            $extension
        );

        // Delete old image if exists
        $settingKey = $type === 'favicon' ? 'favicon_url' : 'logo_url';
        $oldValue = Setting::get($settingKey);
        if ($oldValue) {
            $oldFilePath = str_replace('/storage/', 'public/', $oldValue);
            if (Storage::exists($oldFilePath)) {
                Storage::delete($oldFilePath);
            }
        }

        // Store new file
        $file->storeAs($storagePath, $filename);
        $publicUrl = '/storage/settings/' . $filename;

        // Save to settings
        Setting::set($settingKey, $publicUrl, 'image');

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $publicUrl,
                'type' => $type,
            ],
            'message' => ucfirst($type) . ' uploaded successfully',
        ]);
    }

    /**
     * Delete image (favicon or logo)
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete images',
            ], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:favicon,logo',
        ]);

        $type = $validated['type'];
        $settingKey = $type === 'favicon' ? 'favicon_url' : 'logo_url';

        // Delete file if exists
        $currentValue = Setting::get($settingKey);
        if ($currentValue) {
            $filePath = str_replace('/storage/', 'public/', $currentValue);
            if (Storage::exists($filePath)) {
                Storage::delete($filePath);
            }
        }

        // Clear setting
        Setting::set($settingKey, null, 'image');

        return response()->json([
            'success' => true,
            'message' => ucfirst($type) . ' deleted successfully',
        ]);
    }
}
