<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Http\Resources\TemplateResource;
use App\Http\Controllers\BaseCRUDController;

class TemplateController extends BaseCRUDController
{
    public function model(): string
    {
        return Template::class;
    }

    protected function validationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
        ];
    }

    protected function resource(): string
    {
        return TemplateResource::class;
    }
}
