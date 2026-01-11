<?php

namespace App\Observers;

use App\Models\Page;

class PageObserver
{
    public function saving(Page $page): void
    {
        if (!$page->index) {
            return;
        }

        Page::query()
            ->where('index', true)
            ->when($page->exists, fn ($query) => $query->where('id', '!=', $page->id))
            ->update(['index' => false]);
    }
}
