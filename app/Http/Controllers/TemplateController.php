<?php

namespace App\Http\Controllers;

use App\Http\Resources\TemplateResource;
use App\Models\Template;

class TemplateController extends CRUDController
{
    public function model(): string
    {
        return Template::class;
    }

    protected function resource(): string
    {
        return TemplateResource::class;
    }

    protected function validationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string'],
        ];
    }

    protected function validationMessages(): array
    {
        return [
            'name.required' => 'Название шаблона обязательно для заполнения.',
            'name.string' => 'Название шаблона должно быть строкой.',
            'name.max' => 'Название шаблона не должно превышать 255 символов.',
            'value.string' => 'Значение шаблона должно быть строкой.',
        ];
    }
}
