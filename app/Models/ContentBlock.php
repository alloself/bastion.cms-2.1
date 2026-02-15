<?php

namespace App\Models;

use App\Models\Traits\HasFile;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Kalnoy\Nestedset\NodeTrait;

class ContentBlock extends CRUDModel
{
    use HasFile, NodeTrait;

    protected $fillable = ['name', 'content', 'order', 'parent_id', 'template_id'];

    public array $interfaces = [
        'parent_id' => [
            'type' => 'string | null',
        ],
        'has_children' => [
            'type' => 'boolean | null',
        ],
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
