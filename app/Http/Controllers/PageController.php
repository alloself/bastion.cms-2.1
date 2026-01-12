<?php

namespace App\Http\Controllers;

use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function children(Request $request, string $id)
    {
        $relations = array_filter(explode(',', $request->input('relations', '')));
        
        $children = DB::transaction(function () use ($id, $relations) {
            $page = Page::findOrFail($id);
            $query = $page->children();
            
            if (count($relations)) {
                $query->with($relations);
            }
            
            return $query->get();
        });

        return PageResource::collection($children);
    }
}
