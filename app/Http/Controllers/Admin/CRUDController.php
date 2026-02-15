<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

abstract class CRUDController extends Controller
{
    abstract public function model(): string;

    protected function resource(): string
    {
        return JsonResource::class;
    }

    protected function validationRules(): array
    {
        return [];
    }

    protected function validationMessages(): array
    {
        return [];
    }

    protected function getValidatedData(Request $request): array
    {
        $rules = $this->validationRules();

        if (count($rules) === 0) {
            return $request->all();
        }

        return $request->validate($rules, $this->validationMessages());
    }

    public function index(Request $request)
    {
        $modelClass = $this->model();

        $resourceClass = $this->resource();

        $paginator = DB::transaction(function () use ($modelClass, $request) {
            $query = $modelClass::query();

            $search = $request->input('search');
            $searchableFields = $modelClass::getSearchableFields();

            $includes = $request->input('includes', []);

            $hasSearch = $search && count($searchableFields) > 0;
            $hasIncludes = count($includes) > 0;


            if ($hasSearch) {
                $query->where(function ($filterQuery) use ($searchableFields, $search, $hasIncludes, $includes) {
                    if ($hasIncludes) {
                        $filterQuery->whereIn('id', $includes);
                    }
                    $filterQuery->orWhere(function ($searchQuery) use ($searchableFields, $search) {
                        foreach ($searchableFields as $field) {
                            if (str_contains($field, '.')) {
                                [$relation, $column] = explode('.', $field, 2);
                                $searchQuery->orWhereHas($relation, function ($relationQuery) use ($column, $search) {
                                    $relationQuery->where($column, 'LIKE', "%{$search}%");
                                });
                            } else {
                                $searchQuery->orWhere($field, 'LIKE', "%{$search}%");
                            }
                        }
                    });
                });
            }

            if ($hasIncludes) {
                $placeholders = implode(',', array_fill(0, count($includes), '?'));
                $query->orderByRaw("CASE WHEN id IN ($placeholders) THEN 0 ELSE 1 END", $includes);
            }

            $sortby = $request->input('sortBy', []);
            foreach ($sortby as $param) {
                $parts = explode(':', $param);
                if (count($parts) === 2) {
                    [$key, $order] = $parts;
                    if (in_array($order, ['asc', 'desc'], true)) {
                        if (str_contains($key, '.')) {
                            $query->orderByPowerJoins($key, $order);
                        } else {
                            $query->orderBy($key, $order);
                        }
                    }
                }
            }

            $relations = array_filter(explode(',', $request->input('relations', '')));

            if (count($relations) > 0) {
                $query->with($relations);
            }

            $perPage = $request->input('per_page', 5);
            $paginator = $query->paginate($perPage);
            $paginator->appends($request->query());

            return $paginator;
        });

        return $resourceClass::collection($paginator);
    }

    public function show(Request $request, string $id)
    {
        $modelClass = $this->model();

        $relations = array_filter(explode(',', $request->input('relations', '')));
        $entity = DB::transaction(function () use ($modelClass, $id, $relations) {
            return $modelClass::showEntity($id, $relations);
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function store(Request $request)
    {
        $data = $this->getValidatedData($request);
        $modelClass = $this->model();
        $relations = array_filter(explode(',', $request->input('relations', '')));

        $entity = DB::transaction(function () use ($modelClass, $data, $relations) {
            $entity = $modelClass::createEntity($data);

            if (count($relations) > 0) {
                $entity->load($relations);
            }

            return $entity;
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function update(Request $request, string $id)
    {
        $data = $this->getValidatedData($request);
        $modelClass = $this->model();
        $relations = array_filter(explode(',', $request->input('relations', '')));

        $entity = DB::transaction(function () use ($modelClass, $id, $data, $relations) {
            $entity = $modelClass::showEntity($id);
            $entity->updateEntity($data);

            if (count($relations) > 0) {
                $entity->load($relations);
            }

            return $entity;
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function destroy(string $id)
    {
        $modelClass = $this->model();

        $deleted = DB::transaction(function () use ($modelClass, $id) {
            $entity = $modelClass::showEntity($id);

            return $entity->deleteEntity();
        });

        if ($deleted !== true) {
            return response()->json(['message' => 'Unable to delete resource'], 500);
        }

        return response()->json(null, 204);
    }

    public function deleteMany(Request $request)
    {
        $payload = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['string'],
        ]);

        $ids = $payload['ids'];
        $modelClass = $this->model();

        $deletedCount = DB::transaction(function () use ($modelClass, $ids) {

            $entities = $modelClass::query()
                ->whereIn('id', $ids)
                ->get();

            $deleted = 0;

            foreach ($entities as $entity) {
                if ($entity->deleteEntity() === true) {
                    $deleted++;
                }
            }

            return $deleted;
        });

        return response()->json([
            'deleted' => $deletedCount,
            'requested' => count($ids),
        ]);
    }
}
