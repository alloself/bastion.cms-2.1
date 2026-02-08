<?php

namespace App\Models\Traits;

use App\Models\Link;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use OwenIt\Auditing\Events\AuditCustom;

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

    public function auditLinkChanges(Link $link): void
    {
        $auditedFields = $this->getAuditedLinkFields();
        $changedValues = array_intersect_key($link->getChanges(), array_flip($auditedFields));

        if (count($changedValues) === 0) {
            return;
        }

        $customOld = [];
        $customNew = [];

        foreach (array_keys($changedValues) as $field) {
            $customOld["link.$field"] = $link->getOriginal($field);
            $customNew["link.$field"] = $link->getAttribute($field);
        }

        $this->auditEvent = 'updated';
        $this->isCustomEvent = true;
        $this->auditCustomOld = $customOld;
        $this->auditCustomNew = $customNew;

        event(new AuditCustom($this));
    }

    protected function getAuditedLinkFields(): array
    {
        return ['title', 'url'];
    }
}
