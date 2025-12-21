<?php


use Illuminate\Support\Facades\Route;

$resources = [
    

];


Route::prefix('admin')->middleware(['auth:sanctum', 'role:root'])->group(function () use ($resources) {
    // Route::get('me', [UserController::class, 'me']);

    Route::apiResources($resources);

    Route::prefix('batch')->group(function () use ($resources) {
        Route::prefix('delete')->group(function () use ($resources) {   
            foreach ($resources as $route => $controller) {
                Route::delete($route, [$controller, 'deleteMany']);
            }
        });
    });
});


Route::prefix('public')->group(function () {
    // Route::get('me', [UserController::class, 'me']);
});