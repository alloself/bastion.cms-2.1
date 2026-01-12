<?php

namespace App\Http\Controllers;

use App\Http\Resources\PageResource;
use App\Models\Page;

class PageController extends CRUDController
{
    public function model(): string
    {
        return Page::class;
    }

    protected function resource(): string
    {
        return PageResource::class;
    }

    protected function validationRules(): array
    {
        return [
            'link.title' => ['required', 'string', 'max:255'],
            'link.subtitle' => ['nullable', 'string', 'max:255'],
            'link.slug' => ['nullable', 'string', 'max:255'],
            'link.url' => ['nullable', 'string', 'max:255'],
            'index' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
            'parent_id' => ['nullable', 'uuid', 'exists:pages,id'],
            'template_id' => ['nullable', 'uuid', 'exists:templates,id'],
        ];
    }

    protected function validationMessages(): array
    {
        return [
            'link.title.required' => 'Заголовок страницы обязателен для заполнения.',
            'link.title.string' => 'Заголовок страницы должен быть строкой.',
            'link.title.max' => 'Заголовок страницы не должен превышать 255 символов.',
        ];
    }
}
