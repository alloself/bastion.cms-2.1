<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiteController;

Route::get('/admin/{any?}', [SiteController::class, 'admin'])
    ->where('any', '.*')
    ->name('admin');