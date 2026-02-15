<?php

use App\Http\Controllers\Admin\SiteController as AdminSiteController;
use App\Http\Controllers\Site\SiteController as SiteSiteController;
use Illuminate\Support\Facades\Route;

Route::get('/admin/{any?}', [AdminSiteController::class, 'admin'])
    ->where('any', '.*')
    ->name('admin');

Route::get('{any?}', [SiteSiteController::class, 'site'])
    ->where('any', '.*')
    ->name('site');
