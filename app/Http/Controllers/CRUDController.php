<?php

namespace App\Http\Controllers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

abstract class CRUDController extends Controller
{
    abstract public function model(): string;

    protected function resource(): string
    {
        return JsonResource::class;
    }

    public function index(Request $request)
    {
        $modelClass = $this->model();

        $resourceClass = $this->resource();

        $paginator = DB::transaction(function () use ($modelClass, $request) {
            $query = $modelClass::query();

            $search = $request->input('search');
            if ($search) {
                $searchableFields = $modelClass::getSearchableFields();
                if (count($searchableFields) > 0) {
                    $query->where(function ($subQuery) use ($searchableFields, $search) {
                        foreach ($searchableFields as $field) {
                            $subQuery->orWhere($field, 'LIKE', "%{$search}%");
                        }
                    });
                }
            }

            $sortby = $request->input('sortBy', []);
            foreach ($sortby as $param) {
                $parts = explode(':', $param);
                if (count($parts) === 2) {
                    [$key, $order] = $parts;
                    if (in_array($order, ['asc', 'desc'], true)) {
                        $query->orderBy($key, $order);
                    }
                }
            }

            $perPage = $request->input('per_page', 15);
            $paginator = $query->paginate($perPage);
            $paginator->appends($request->query());

            return $paginator;
        });

        return $resourceClass::collection($paginator);
    }

    public function show(Request $request, string $id)
    {
        $modelClass = $this->model();

        $entity = DB::transaction(function () use ($modelClass, $id) {
            return $modelClass::showEntity($id);
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function store(Request $request)
    {
        $modelClass = $this->model();

        $entity = DB::transaction(function () use ($modelClass, $request) {
            return $modelClass::createEntity($request->all());
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function update(Request $request, string $id)
    {
        $modelClass = $this->model();

        $entity = DB::transaction(function () use ($modelClass, $id, $request) {
            $entity = $modelClass::showEntity($id);
            $entity->updateEntity($request->all());

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
