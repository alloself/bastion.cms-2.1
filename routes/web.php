<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiteController;

Route::get('/admin/{any?}', [SiteController::class, 'admin'])
    ->where('any', '.*')
    ->name('admin');

Route::get('{any?}', [SiteController::class, 'site'])
    ->where('any', '.*')
    ->name('site');
