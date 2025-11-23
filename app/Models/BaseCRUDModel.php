<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\Relation;

abstract class BaseCRUDModel extends Model implements AuditableContract
{
    use Auditable, HasUuids, SoftDeletes;

    public function isRelatedTo(string $relationName): bool
    {
        return method_exists($this, $relationName)
            && $this->{$relationName}() instanceof Relation;
    }

    public static function createEntity(array $data): self
    {
        return static::query()->create($data);
    }

    public static function showEntity($id, array $with = []): self
    {
        $entity = static::with($with)->findOrFail($id);

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
        if ($this->isRelatedTo('children') && $this->children()->count()) {
            $this->children()->delete();
        }
        return $this->delete();
    }
}
