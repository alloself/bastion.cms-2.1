<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentBlockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasChildren = $this->relationLoaded('children')
            ? $this->children->isNotEmpty()
            : $this->children()->exists();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'content' => $this->content,
            'order' => $this->order,
            'parent_id' => $this->parent_id,
            'template_id' => $this->template_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'template' => $this->whenLoaded('template', function () {
                return new TemplateResource($this->template);
            }),
            'parent' => $this->whenLoaded('parent', function () {
                return new ContentBlockResource($this->parent);
            }),
            'has_children' => $hasChildren,
            'children' => $this->when($hasChildren, function () {
                return $this->relationLoaded('children') && $this->children->isNotEmpty()
                    ? ContentBlockResource::collection($this->children)
                    : [];
            }),
            'images' => $this->whenLoaded('images', fn () => FileResource::collection($this->images)),
            'files' => $this->whenLoaded('files', fn () => FileResource::collection($this->files)),
            'videos' => $this->whenLoaded('videos', fn () => FileResource::collection($this->videos)),
        ];
    }
}
