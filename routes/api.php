<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

$resources = [
    'user' => UserController::class,
    'page' => PageController::class,

];


Route::prefix('admin')->middleware(['auth:sanctum', 'role:root'])->group(function () use ($resources) {
    Route::get('me', [UserController::class, 'me']);

    Route::apiResources($resources);

    Route::prefix('destroy')->group(function () use ($resources) {
        foreach ($resources as $route => $controller) {
            Route::post($route, [$controller, 'deleteMany']);
        }
    });
});


Route::prefix('public')->group(function () {
    Route::get('me', [UserController::class, 'me']);
});
