<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Models\Audit as ModelsAudit;

class AuditModel extends ModelsAudit
{
    use HasUuids;
}