<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Company;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only Super Admin can see all companies
        if (!$user->isSuperAdmin()) {
            $company = $user->company;
            $company->load('collections');
            return response()->json([
                'success' => true,
                'data' => [$company],
            ]);
        }

        $companies = Company::with('collections')
            ->withCount(['users', 'items'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create companies',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'tax_id' => 'nullable|string|max:50|unique:companies',
            'address' => 'nullable|string|max:300',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'logo_url' => 'nullable|string|max:500',
        ]);

        $company = Company::create($validated);

        return response()->json([
            'success' => true,
            'data' => $company,
            'message' => 'Company created successfully',
        ], 201);
    }

    public function show(Request $request, Company $company): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && $user->id_company !== $company->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this company',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $company->load('collections')->loadCount(['users', 'items']),
        ]);
    }

    public function update(Request $request, Company $company): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update companies',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:200',
            'tax_id' => 'nullable|string|max:50|unique:companies,tax_id,' . $company->id,
            'address' => 'nullable|string|max:300',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'logo_url' => 'nullable|string|max:500',
            'active' => 'sometimes|boolean',
            'collections' => 'sometimes|array',
            'collections.*.id' => 'required|exists:collections,id',
            'collections.*.visible' => 'required|boolean',
        ]);

        // Update company basic data
        $companyData = collect($validated)->except('collections')->toArray();
        $company->update($companyData);

        // Update collection visibility if provided
        if (isset($validated['collections'])) {
            $syncData = [];
            foreach ($validated['collections'] as $col) {
                $syncData[$col['id']] = ['visible' => $col['visible']];
            }
            $company->collections()->sync($syncData);
        }

        return response()->json([
            'success' => true,
            'data' => $company->load('collections'),
            'message' => 'Company updated successfully',
        ]);
    }

    public function destroy(Request $request, Company $company): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete companies',
            ], 403);
        }

        $company->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully',
        ]);
    }
}
