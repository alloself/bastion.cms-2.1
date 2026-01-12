<?php

namespace App\Http\Controllers;

use App\Http\Resources\LinkResource;
use App\Models\Link;

class LinkController extends CRUDController
{
    public function model(): string
    {
        return Link::class;
    }

    protected function resource(): string
    {
        return LinkResource::class;
    }

    protected function validationRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],

        ];
    }

    protected function validationMessages(): array
    {
        return [
            'title.required' => 'Заголовок ссылки обязателен для заполнения.',
            'title.string' => 'Заголовок ссылки должен быть строкой.',
            'title.max' => 'Заголовок ссылки не должен превышать 255 символов.',
            'subtitle.string' => 'Подзаголовок ссылки должен быть строкой.',
            'subtitle.max' => 'Подзаголовок ссылки не должен превышать 255 символов.',
            'slug.string' => 'Slug ссылки должен быть строкой.',
            'slug.max' => 'Slug ссылки не должен превышать 255 символов.',
            'url.string' => 'URL ссылки должен быть строкой.',
            'url.max' => 'URL ссылки не должен превышать 255 символов.',
            'linkable_id.uuid' => 'ID связанного объекта должен быть валидным UUID.',
            'linkable_type.string' => 'Тип связанного объекта должен быть строкой.',
            'linkable_type.max' => 'Тип связанного объекта не должен превышать 255 символов.',
        ];
    }
}
