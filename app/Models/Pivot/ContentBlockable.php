<?php

namespace App\Models\Pivot;

use App\Models\ContentBlock;
use Illuminate\Database\Eloquent\Relations\MorphPivot;

class ContentBlockable extends MorphPivot
{
    protected $fillable = [
        'content_block_id',
        'content_blockable_id',
        'content_blockable_type',
        'key',
        'order',
        'is_visible',
    ];

    public array $interfaces = [
        'is_visible' => [
            'type' => 'boolean',
        ],
        'key' => [
            'type' => 'string | null',
        ],
        'order' => [
            'type' => 'integer',
        ],
    ];

    public function contentBlockable()
    {
        return $this->morphTo();
    }

    public function contentBlock()
    {
        return $this->belongsTo(ContentBlock::class);
    }
}
