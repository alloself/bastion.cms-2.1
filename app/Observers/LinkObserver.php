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
        $this->handleLinkAudit($link);
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

        if (!$linkable || !$link->wasChanged('url')) {
            return;
        }

        $linkable->updateDescendantLinks();
    }

    private function handleLinkAudit(Link $link): void
    {
        $linkable = $link->linkable;

        if ($linkable === null) {
            return;
        }

        $linkable->auditLinkChanges($link);
    }
}
