<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Models\Audit as ModelsAudit;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditModel extends ModelsAudit
{
    use HasUuids;


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}