<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Http\Controllers\BaseCRUDController;
use App\Http\Resources\PageResource;

class PageController extends BaseCRUDController
{
    public function model(): string
    {
        return Page::class;
    }

    protected function validationRules(): array
    {
        return [
            'index' => ['boolean'],
            'meta' => ['nullable', 'json'],
            'parent_id' => ['nullable', 'uuid', 'exists:pages,id'],
            'template_id' => ['nullable', 'uuid', 'exists:templates,id'],
        ];
    }

    protected function resource(): string
    {
        return PageResource::class;
    }
}
