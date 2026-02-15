<?php

use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\ContentBlockController;
use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

$resources = [
    'attribute' => AttributeController::class,
    'content_block' => ContentBlockController::class,
    'file' => FileController::class,
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

    Route::prefix('files')->group(function () {
        Route::post('assign', [FileController::class, 'assign']);
        Route::patch('relation', [FileController::class, 'updateRelation']);
        Route::delete('detach', [FileController::class, 'detach']);
    });

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

