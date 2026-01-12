<?php

namespace App\Models;

use App\Models\Traits\HasLink;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kalnoy\Nestedset\NodeTrait;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Page extends CRUDModel
{
    use NodeTrait, HasLink;

    public function shouldRegenerateChildLinks(): bool
    {
        return true;
    }

    protected $fillable = ['index', 'meta', 'parent_id', 'template_id'];


    public array $interfaces = [
        'parent_id' => [
            'type' => 'string | null',
        ],
        'has_children' => [
            'type' => 'boolean | null',
        ],
    ];

    protected array $searchable = ['id'];

    protected $casts = [
        'index' => 'boolean',
        'meta' => 'object',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function generateLinkUrl(Link $link): string
    {
        if ($this->index) {
            return '/';
        }

        return $this->buildUrlFromAncestors($link->slug);
    }

    public function updateDescendantLinks(): void
    {
        $descendants = $this->descendants()->with('links')->get();

        foreach ($descendants as $descendantPage) {
            $descendantPage->regenerateLinksUrl();
        }
    }

    private function buildUrlFromAncestors(string $currentSlug): string
    {
        $slugs = $this->ancestors()
            ->with('links')
            ->get()
            ->reduce(function (array $accumulator, Page $ancestorPage) {
                $ancestorLink = $ancestorPage->links->first();

                if ($ancestorLink !== null && $ancestorPage->index !== true) {
                    $accumulator[] = $ancestorLink->slug;
                }

                return $accumulator;
            }, []);

        $slugs[] = $currentSlug;

        return '/' . implode('/', $slugs);
    }

    public function link(): MorphOne
    {
        return $this->morphOne(Link::class, 'linkable');
    }

    public static function createEntity(array $data, array $relations = []): self
    {
        $linkData = $data['link'] ?? [];

        $page = static::query()->create($data);

        if (!empty($linkData)) {
            $page->link()->create($linkData);
        }

        if (!empty($relations)) {
            $page->load($relations);
        }

        return $page;
    }

    public function updateEntity(array $data, array $relations = []): self
    {
        $linkData = $data['link'] ?? [];

        $this->update($data);

        if ($this->wasChanged('index')) {
            unset($linkData['url']);
        }

        if (!empty($linkData)) {
            $existingLink = $this->link;

            if ($existingLink) {
                $existingLink->update($linkData);
            } else {
                $this->link()->create($linkData);
            }
        }

        if (!empty($relations)) {
            $this->load($relations);
        }

        return $this;
    }
}
