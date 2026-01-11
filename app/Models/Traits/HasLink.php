<?php

namespace App\Models\Traits;

use App\Models\Link;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasLink
{
    abstract public function generateLinkUrl(Link $link): string;

    abstract public function updateDescendantLinks(): void;

    public function links(): MorphMany
    {
        return $this->morphMany(Link::class, 'linkable');
    }

    public function regenerateLinksUrl(): void
    {
        $this->links->each(function (Link $link) {
            $link->url = $this->generateLinkUrl($link);
            $link->saveQuietly();
        });
    }
}
