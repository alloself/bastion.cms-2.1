<?php

namespace App\Observers;

use App\Models\Link;

class LinkObserver
{
    public function creating(Link $link): void
    {
        $this->generateUrlIfNeeded($link);
    }

    public function updating(Link $link): void
    {
        $this->generateUrlIfNeeded($link);
    }

    public function updated(Link $link): void
    {
        $this->regenerateChildLinksIfNeeded($link);
    }

    private function generateUrlIfNeeded(Link $link): void
    {
        $linkable = $link->linkable;

        if (!$linkable) {
            return;
        }

        $isUrlManuallySet = $link->isDirty('url') && $link->url;

        if ($isUrlManuallySet) {
            return;
        }

        $link->url = $linkable->generateLinkUrl($link);
    }

    private function regenerateChildLinksIfNeeded(Link $link): void
    {
        $linkable = $link->linkable;
        $shouldRegenerate = $linkable->shouldRegenerateChildLinks ?? false;

        if (!$linkable || !$link->wasChanged('url') || !$shouldRegenerate) {
            return;
        }

        $linkable->updateDescendantLinks();
    }
}
