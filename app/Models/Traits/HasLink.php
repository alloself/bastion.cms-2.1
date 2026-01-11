<?php

namespace App\Models\Traits;

use App\Models\Link;

trait HasLink
{
    public function links()
    {
        return $this->morphMany(Link::class, 'linkable');
    }
}