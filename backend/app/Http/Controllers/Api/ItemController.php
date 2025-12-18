<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Taxonomy;
use App\Models\ItemImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Item::with(['collection', 'company', 'user', 'taxonomy', 'images']);

        // Filter by company according to role
        if (!$user->isSuperAdmin()) {
            $query->where('id_company', $user->id_company);
        }

        // Optional filters
        if ($request->has('id_collection')) {
            $query->where('id_collection', $request->id_collection);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('scientific_name', 'like', "%{$search}%")
                    ->orWhere('common_name', 'like', "%{$search}%");
            });
        }

        // Editor only sees their items
        if ($user->isEditor()) {
            $query->where('id_user', $user->id);
        }

        $items = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'id_collection' => 'required|exists:collections,id',
            'scientific_name' => 'required|string|max:200',
            'common_name' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'history' => 'nullable|string',
            'notes' => 'nullable|string',
            'location_detail' => 'nullable|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'quantity' => 'nullable|integer|min:1',
            'planting_date' => 'nullable|date',
            'germination_date' => 'nullable|date',
            'additional_info_url' => 'nullable|string|max:500',
            'id_location' => 'nullable|exists:locations,id',
            // Taxonomy
            'taxonomy.kingdom' => 'nullable|string|max:100',
            'taxonomy.phylum' => 'nullable|string|max:100',
            'taxonomy.class' => 'nullable|string|max:100',
            'taxonomy.order' => 'nullable|string|max:100',
            'taxonomy.family' => 'nullable|string|max:100',
            'taxonomy.genus' => 'nullable|string|max:100',
            'taxonomy.species' => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();

        try {
            // Create taxonomy if provided
            $taxonomyId = null;
            if ($request->has('taxonomy')) {
                $taxonomy = Taxonomy::create($request->taxonomy);
                $taxonomyId = $taxonomy->id;
            }

            // Create item
            $item = Item::create([
                'id_collection' => $validated['id_collection'],
                'id_company' => $user->id_company,
                'id_user' => $user->id,
                'id_location' => $validated['id_location'] ?? null,
                'id_taxonomy' => $taxonomyId,
                'scientific_name' => $validated['scientific_name'],
                'common_name' => $validated['common_name'] ?? null,
                'description' => $validated['description'] ?? null,
                'history' => $validated['history'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'location_detail' => $validated['location_detail'] ?? null,
                'coordinates' => $validated['coordinates'] ?? null,
                'quantity' => $validated['quantity'] ?? 1,
                'planting_date' => $validated['planting_date'] ?? null,
                'germination_date' => $validated['germination_date'] ?? null,
                'additional_info_url' => $validated['additional_info_url'] ?? null,
                'status' => 'VISIBLE',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $item->load(['collection', 'company', 'user', 'taxonomy', 'images']),
                'message' => 'Item created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating item: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Item $item): JsonResponse
    {
        $user = $request->user();

        // Verify view permissions
        if (!$user->isSuperAdmin() && $user->id_company !== $item->id_company) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this item',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $item->load(['collection', 'company', 'user', 'location', 'taxonomy', 'images', 'qrImage']),
        ]);
    }

    public function update(Request $request, Item $item): JsonResponse
    {
        $user = $request->user();

        // Verify permissions
        if (!$user->canEditItem($item)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this item',
            ], 403);
        }

        $validated = $request->validate([
            'id_collection' => 'sometimes|exists:collections,id',
            'scientific_name' => 'sometimes|required|string|max:200',
            'common_name' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'history' => 'nullable|string',
            'notes' => 'nullable|string',
            'location_detail' => 'nullable|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'quantity' => 'nullable|integer|min:1',
            'planting_date' => 'nullable|date',
            'germination_date' => 'nullable|date',
            'additional_info_url' => 'nullable|string|max:500',
            'id_location' => 'nullable|exists:locations,id',
            'status' => 'sometimes|in:VISIBLE,NOT_VISIBLE',
            // Taxonomy
            'taxonomy.kingdom' => 'nullable|string|max:100',
            'taxonomy.phylum' => 'nullable|string|max:100',
            'taxonomy.class' => 'nullable|string|max:100',
            'taxonomy.order' => 'nullable|string|max:100',
            'taxonomy.family' => 'nullable|string|max:100',
            'taxonomy.genus' => 'nullable|string|max:100',
            'taxonomy.species' => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();

        try {
            // Update or create taxonomy
            if ($request->has('taxonomy')) {
                if ($item->id_taxonomy) {
                    $item->taxonomy->update($request->taxonomy);
                } else {
                    $taxonomy = Taxonomy::create($request->taxonomy);
                    $validated['id_taxonomy'] = $taxonomy->id;
                }
            }

            // Remove taxonomy from validation array
            unset($validated['taxonomy']);

            $item->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $item->load(['collection', 'company', 'user', 'taxonomy', 'images']),
                'message' => 'Item updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating item: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Item $item): JsonResponse
    {
        $user = $request->user();

        // Verify permissions
        if (!$user->canDeleteItem($item)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this item',
            ], 403);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully',
        ]);
    }

    public function addImages(Request $request, Item $item): JsonResponse
    {
        $user = $request->user();

        if (!$user->canEditItem($item)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to add images to this item',
            ], 403);
        }

        // Check current image count
        $currentImageCount = $item->images()->count();
        $maxImages = 5;

        if ($currentImageCount >= $maxImages) {
            return response()->json([
                'success' => false,
                'message' => "Maximum of {$maxImages} images allowed per item",
            ], 422);
        }

        $validated = $request->validate([
            'images' => 'required|array|max:' . ($maxImages - $currentImageCount),
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 2MB max
        ]);

        // Ensure storage directory exists
        $storagePath = 'public/items/' . $item->id;
        if (!Storage::exists($storagePath)) {
            Storage::makeDirectory($storagePath);
        }

        $images = [];
        $displayOrder = $currentImageCount;

        foreach ($request->file('images') as $file) {
            // Generate unique filename: itemId_userId_timestamp_random.extension
            $extension = $file->getClientOriginalExtension();
            $filename = sprintf(
                '%d_%d_%s_%s.%s',
                $item->id,
                $user->id,
                now()->format('YmdHis'),
                Str::random(8),
                $extension
            );

            // Store file
            $path = $file->storeAs($storagePath, $filename);

            // Create database record
            $images[] = ItemImage::create([
                'id_item' => $item->id,
                'file_url' => '/storage/items/' . $item->id . '/' . $filename,
                'description' => null,
                'image_date' => now(),
                'display_order' => $displayOrder++,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $images,
            'message' => 'Images uploaded successfully',
        ], 201);
    }

    public function deleteImage(Request $request, Item $item, ItemImage $image): JsonResponse
    {
        $user = $request->user();

        if (!$user->canEditItem($item)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete images from this item',
            ], 403);
        }

        if ($image->id_item !== $item->id) {
            return response()->json([
                'success' => false,
                'message' => 'The image does not belong to this item',
            ], 400);
        }

        // Delete file from storage
        $filePath = str_replace('/storage/', 'public/', $image->file_url);
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
