<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'index' => $this->index,
            'meta' => $this->meta,
            'parent_id' => $this->parent_id,
            'template_id' => $this->template_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'link' => $this->whenLoaded('link', function () {
                return new LinkResource($this->link);
            }),
            'template' => $this->whenLoaded('template', function () {
                return new TemplateResource($this->template);
            }),
            'parent' => $this->whenLoaded('parent', function () {
                return new PageResource($this->parent);
            }),
            'has_children' => $this->relationLoaded('children') 
                ? $this->children->isNotEmpty() 
                : $this->children()->exists(),
            'children' => $this->whenLoaded('children', function () {
                return PageResource::collection($this->children);
            }),
        ];
    }
}
