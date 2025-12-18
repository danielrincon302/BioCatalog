<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::where('active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    public function show(Collection $collection): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $collection,
        ]);
    }
}
