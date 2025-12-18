<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Company;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * List public catalog items
     */
    public function index(Request $request): JsonResponse
    {
        $query = Item::with(['collection', 'company', 'taxonomy', 'images'])
            ->visible()
            // Filter by company collection visibility
            ->whereHas('company', function ($q) {
                $q->where('active', true);
            })
            ->where(function ($query) {
                // Include items where the company-collection pair is visible
                // or where there's no configuration (default visible)
                $query->whereExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_company', 'items.id_company')
                        ->whereColumn('company_collection.id_collection', 'items.id_collection')
                        ->where('company_collection.visible', true);
                })
                ->orWhereNotExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_company', 'items.id_company')
                        ->whereColumn('company_collection.id_collection', 'items.id_collection');
                });
            });

        // Filter by collection
        if ($request->has('id_collection')) {
            $query->byCollection($request->id_collection);
        }

        // Filter by company
        if ($request->has('id_company')) {
            $query->byCompany($request->id_company);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('scientific_name', 'like', "%{$search}%")
                    ->orWhere('common_name', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('scientific_name')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * View item detail by slug (public URL)
     */
    public function show(string $slug): JsonResponse
    {
        $item = Item::with(['collection', 'company', 'user', 'location', 'taxonomy', 'images', 'qrImage'])
            ->where('slug', $slug)
            ->visible()
            ->whereHas('company', function ($q) {
                $q->where('active', true);
            })
            ->where(function ($query) {
                // Check collection visibility for the company
                $query->whereExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_company', 'items.id_company')
                        ->whereColumn('company_collection.id_collection', 'items.id_collection')
                        ->where('company_collection.visible', true);
                })
                ->orWhereNotExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_company', 'items.id_company')
                        ->whereColumn('company_collection.id_collection', 'items.id_collection');
                });
            })
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * List available collections (only those visible for at least one company)
     */
    public function collections(): JsonResponse
    {
        $collections = Collection::where('active', true)
            ->where(function ($query) {
                // Show collection if at least one company has it visible
                $query->whereExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_collection', 'collections.id')
                        ->where('company_collection.visible', true);
                })
                // Or if no company has configured it (default visible)
                ->orWhereNotExists(function ($subquery) {
                    $subquery->selectRaw('1')
                        ->from('company_collection')
                        ->whereColumn('company_collection.id_collection', 'collections.id');
                });
            })
            ->withCount(['items' => function ($query) {
                // Count only visible items from visible company-collection pairs
                $query->where('status', 'VISIBLE')
                    ->where(function ($q) {
                        $q->whereExists(function ($subquery) {
                            $subquery->selectRaw('1')
                                ->from('company_collection')
                                ->whereColumn('company_collection.id_company', 'items.id_company')
                                ->whereColumn('company_collection.id_collection', 'items.id_collection')
                                ->where('company_collection.visible', true);
                        })
                        ->orWhereNotExists(function ($subquery) {
                            $subquery->selectRaw('1')
                                ->from('company_collection')
                                ->whereColumn('company_collection.id_company', 'items.id_company')
                                ->whereColumn('company_collection.id_collection', 'items.id_collection');
                        });
                    });
            }])
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    /**
     * List companies with public items
     */
    public function companies(): JsonResponse
    {
        $companies = Company::where('active', true)
            ->whereHas('items', function ($query) {
                $query->where('status', 'VISIBLE');
            })
            ->withCount(['items' => function ($query) {
                $query->where('status', 'VISIBLE');
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }
}
