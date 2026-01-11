<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Link extends CRUDModel
{
    use HasSlug;

    protected $fillable = [
        'title',
        'subtitle',
        'slug',
        'url',
        'linkable_id',
        'linkable_type',
    ];

    protected array $searchable = ['title', 'url', 'slug'];

    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->allowDuplicateSlugs();
    }
}
