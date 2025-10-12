<?php

namespace App\Models\Pivot;

use App\Models\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphPivot;

class Attributeable extends MorphPivot
{
    protected $fillable = [
        'attribute_id',
        'attributeable_id',
        'attributeable_type',
        'value',
        'order'
    ];

    protected $table = 'attributeables';

    public function attributeable(): MorphTo
    {
        return $this->morphTo();
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
