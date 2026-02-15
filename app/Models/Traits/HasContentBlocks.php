<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Relations\MorphToMany;
use App\Models\ContentBlock;
use App\Models\Pivot\ContentBlockable;

trait HasContentBlocks
{
    public function contentBlocks(): MorphToMany
    {
        return $this->morphToMany(ContentBlock::class, 'content_blockable', 'content_blockables')
            ->using(ContentBlockable::class)
            ->withPivot(['key', 'order', 'is_visible'])
            ->orderByPivot('order');
    }
}
