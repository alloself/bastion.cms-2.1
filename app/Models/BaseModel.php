<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\Relation;

abstract class BaseModel extends Model implements AuditableContract
{
    use Auditable, HasUuids, SoftDeletes;

    public function isRelatedTo(string $relationName): bool
    {
        return method_exists($this, $relationName)
            && $this->{$relationName}() instanceof Relation;
    }
}
