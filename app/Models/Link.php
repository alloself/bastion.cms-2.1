<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphTo;

class Link extends CRUDModel
{
    protected $fillable = [
        'title',
        'subtitle',
        'url',
        'linkable_id',
        'linkable_type',
    ];

    protected array $searchable = ['title', 'url'];

    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }
}
