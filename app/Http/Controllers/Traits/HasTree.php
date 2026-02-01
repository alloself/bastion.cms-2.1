<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait HasTree
{
    abstract public function model(): string;

    abstract public function resource(): string;

    public function children(Request $request, string $id)
    {
        $relations = array_filter(explode(',', $request->input('relations', '')));
        
        $children = DB::transaction(function () use ($id, $relations) {
            $model = $this->model();
            $page = $model::findOrFail($id);
            $query = $page->children();

            $filteredRelations = array_filter($relations, function ($relation) use ($page) {
                if (str_contains($relation, 'children')) {
                    return false;
                }

                return $page->isRelatedTo($relation);
            });
            
            if (count($filteredRelations)) {
                $query->with($filteredRelations);
            }
            
            return $query->get();
        });

        return $this->resource()::collection($children);
    }
}
