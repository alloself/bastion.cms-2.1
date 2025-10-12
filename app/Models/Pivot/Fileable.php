<?php

namespace App\Models\Pivot;

use App\Models\File;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphPivot;

class Fileable extends MorphPivot
{

    protected $fillable = [
        'file_id',
        'fileable_id',
        'fileable_type'
    ];

    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }
}
