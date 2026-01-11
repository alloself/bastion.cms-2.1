<?php

namespace App\Providers;

use App\Models\Link;
use App\Models\Page;
use App\Observers\LinkObserver;
use App\Observers\PageObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\View;
use Illuminate\Http\Resources\Json\JsonResource;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        DB::disableQueryLog();
        Model::preventLazyLoading(true);
        View::addNamespace('site', resource_path('site/views'));
        View::addNamespace('admin', resource_path('admin/views'));
        JsonResource::withoutWrapping();

        Link::observe(LinkObserver::class);
        Page::observe(PageObserver::class);
    }
}
