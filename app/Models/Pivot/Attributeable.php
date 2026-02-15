<?php

namespace App\Models\Pivot;

use App\Models\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attributeable extends MorphPivot
{
    protected $fillable = [
        'attribute_id',
        'attributeable_id',
        'attributeable_type',
        'value',
    ];

    public function attributeable(): MorphTo
    {
        return $this->morphTo();
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }
}
