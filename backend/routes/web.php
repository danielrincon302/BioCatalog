<?php

use Illuminate\Support\Facades\Route;

// Web routes (required for Sanctum CSRF cookie)
Route::get('/', function () {
    return response()->json(['message' => 'BioCatalog API']);
});
