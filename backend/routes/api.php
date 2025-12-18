<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Password reset (public)
Route::prefix('password')->group(function () {
    Route::post('/forgot', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset', [PasswordResetController::class, 'resetPassword']);
});

// Public catalog
Route::prefix('catalog')->group(function () {
    Route::get('/', [CatalogController::class, 'index']);
    Route::get('/collections', [CatalogController::class, 'collections']);
    Route::get('/companies', [CatalogController::class, 'companies']);
    Route::get('/{slug}', [CatalogController::class, 'show']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Collections (read-only for authenticated users)
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/{collection}', [CollectionController::class, 'show']);

    // Companies
    Route::apiResource('companies', CompanyController::class);

    // Users
    Route::apiResource('users', UserController::class);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Items
    Route::apiResource('items', ItemController::class);
    Route::post('/items/{item}/images', [ItemController::class, 'addImages']);
    Route::delete('/items/{item}/images/{image}', [ItemController::class, 'deleteImage']);
});
