<?php

namespace App\Http\Controllers;

use App\Models\BaseCRUDModel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

abstract class BaseCRUDController extends Controller
{
    abstract public function model(): string;

    protected function allowedRelations(): array
    {
        return [];
    }

    protected function validationRules(): array
    {
        return [];
    }

    protected function resource(): string
    {
        return JsonResource::class;
    }

    protected function resolveRelations(Request $request): array
    {
        $allowedRelations = $this->allowedRelations();

        if (empty($allowedRelations)) {
            return [];
        }

        $with = $request->query('with');

        if ($with === null) {
            return [];
        }

        $requestedRelations = [];

        if (is_string($with)) {
            $items = explode(',', $with);

            foreach ($items as $item) {
                $relationName = trim($item);

                if ($relationName !== '') {
                    $requestedRelations[] = $relationName;
                }
            }
        } elseif (is_array($with)) {
            foreach ($with as $item) {
                if (is_string($item)) {
                    $relationName = trim($item);

                    if ($relationName !== '') {
                        $requestedRelations[] = $relationName;
                    }
                }
            }
        }

        if (empty($requestedRelations)) {
            return [];
        }

        $relations = [];

        foreach ($requestedRelations as $relationName) {
            if (in_array($relationName, $allowedRelations, true)) {
                $relations[] = $relationName;
            }
        }

        return $relations;
    }

    public function index(Request $request)
    {
        $modelClass = $this->model();
        $relations = $this->resolveRelations($request);

        $resourceClass = $this->resource();

        $paginator = DB::transaction(function () use ($modelClass, $relations, $request) {
            $query = $modelClass::query();

            if (!empty($relations)) {
                $query->with($relations);
            }

            $perPage = $request->query('per_page', 15);

            $paginator = $query->paginate($perPage);
            $paginator->appends($request->query());

            return $paginator;
        });

        return $resourceClass::collection($paginator);
    }

    public function show(Request $request, string $id): JsonResource
    {
        $modelClass = $this->model();
        $relations = $this->resolveRelations($request);

        $entity = DB::transaction(function () use ($modelClass, $id, $relations) {
            return $modelClass::showEntity($id, $relations);
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function store(Request $request)
    {
        $rules = $this->validationRules();
        $validatedData = $request->validate($rules);

        $modelClass = $this->model();

        $entity = DB::transaction(function () use ($modelClass, $validatedData) {
            return $modelClass::createEntity($validatedData);
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function update(Request $request, string $id): JsonResource
    {
        $rules = $this->validationRules();
        $validatedData = $request->validate($rules);

        $modelClass = $this->model();
        $relations = $this->resolveRelations($request);

        $entity = DB::transaction(function () use ($modelClass, $id, $relations, $validatedData) {
            $entity = $modelClass::showEntity($id, $relations);
            $entity->updateEntity($validatedData, $relations);

            return $entity;
        });

        $resourceClass = $this->resource();

        return new $resourceClass($entity);
    }

    public function destroy(string $id): JsonResponse
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

    public function deleteMany(Request $request): JsonResponse
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
