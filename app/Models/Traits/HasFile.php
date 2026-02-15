<?php

namespace App\Models\Traits;

use App\Models\File;
use App\Models\Pivot\Fileable;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasFile
{
    public function images(): MorphToMany
    {
        return $this->morphToMany(File::class, 'fileable', 'fileables')
            ->using(Fileable::class)
            ->wherePivot('type', 'image')
            ->withPivot(['type', 'key', 'order'])
            ->orderByPivot('order');
    }

    public function files(): MorphToMany
    {
        return $this->morphToMany(File::class, 'fileable', 'fileables')
            ->using(Fileable::class)
            ->wherePivot('type', 'file')
            ->withPivot(['type', 'key', 'order'])
            ->orderByPivot('order');
    }

    public function videos(): MorphToMany
    {
        return $this->morphToMany(File::class, 'fileable', 'fileables')
            ->using(Fileable::class)
            ->wherePivot('type', 'video')
            ->withPivot(['type', 'key', 'order'])
            ->orderByPivot('order');
    }
}
