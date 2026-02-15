<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\ContentBlockController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

$resources = [
    'content_block' => ContentBlockController::class,
    'page' => PageController::class,
    'template' => TemplateController::class,
];

$treeResources = [
    'content_block' => ContentBlockController::class,
    'page' => PageController::class,
];



Route::prefix('admin')->middleware(['auth:sanctum', 'role:root'])->group(function () use ($resources, $treeResources) {
    Route::get('me', [UserController::class, 'me']);
    Route::get('audits', [AuditController::class, 'index']);


    foreach ($treeResources as $route => $controller) {
        Route::get("{$route}/{id}/children", [$controller, 'children']);
    }

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
    Route::get('me', [UserController::class, 'me']);
});

