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
            
            if (count($relations)) {
                $query->with($relations);
            }
            
            return $query->get();
        });

        return $this->resource()::collection($children);
    }
}
