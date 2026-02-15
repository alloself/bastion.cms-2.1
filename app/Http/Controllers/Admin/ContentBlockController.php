<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Traits\HasTree;
use App\Http\Resources\ContentBlockResource;
use App\Models\ContentBlock;

class ContentBlockController extends CRUDController
{
    use HasTree;

    public function model(): string
    {
        return ContentBlock::class;
    }

    protected function resource(): string
    {
        return ContentBlockResource::class;
    }

    protected function validationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'parent_id' => ['nullable', 'uuid', 'exists:content_blocks,id'],
            'template_id' => ['nullable', 'uuid', 'exists:templates,id'],
        ];
    }

    protected function validationMessages(): array
    {
        return [
            'name.required' => 'Название блока обязательно для заполнения.',
            'name.string' => 'Название блока должно быть строкой.',
            'name.max' => 'Название блока не должно превышать 255 символов.',
            'content.string' => 'Содержимое блока должно быть строкой.',
            'order.integer' => 'Порядок должен быть целым числом.',
            'order.min' => 'Порядок не может быть отрицательным.',
            'parent_id.uuid' => 'ID родительского блока должен быть валидным UUID.',
            'parent_id.exists' => 'Родительский блок не найден.',
            'template_id.uuid' => 'ID шаблона должен быть валидным UUID.',
            'template_id.exists' => 'Шаблон не найден.',
        ];
    }
}
