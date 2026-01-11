<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\Relation;

abstract class CRUDModel extends Model implements AuditableContract
{
    use Auditable, HasUuids, SoftDeletes;

    protected array $searchable = [];

    public static function getSearchableFields(): array
    {
        return (new static())->searchable;
    }

    public function isRelatedTo(string $relationName): bool
    {
        return method_exists($this, $relationName)
            && $this->{$relationName}() instanceof Relation;
    }

    public static function createEntity(array $data, array $relations = []): self
    {
        $entity = static::query()->create($data);
        
        if (!empty($relations)) {
            $entity->load($relations);
        }
        return $entity;
    }

    public static function showEntity($id, array $relations = []): self
    {
        $entity = static::with($relations)->findOrFail($id);

        return $entity;
    }

    public function updateEntity(array $data, array $with = []): self
    {
        $this->update($data);

        if (!empty($with)) {
            $this->load($with);
        }

        return $this;
    }

    public function deleteEntity(): bool
    {
        return $this->delete();
    }
}