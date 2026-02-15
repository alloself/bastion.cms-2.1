<?php

namespace App\Models\Traits;

use App\Models\Attribute;
use App\Models\Pivot\Attributeable;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasAttributes
{
    public function attributes(): MorphToMany
    {
        return $this->morphToMany(Attribute::class, 'attributeable', 'attributeables')
            ->using(Attributeable::class)
            ->withPivot('value');
    }
}
