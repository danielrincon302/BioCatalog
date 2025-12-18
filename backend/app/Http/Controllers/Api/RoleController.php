<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::where('active', true)->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
