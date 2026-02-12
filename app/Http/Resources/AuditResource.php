<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $resolvedValues = $this->resolveAuditValuesFromAuditable();

        return [
            'id' => $this->id,
            'event' => $this->event,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'email' => $this->user->email,
            ]),
            'resolved_values' => $resolvedValues,
        ];
    }

    private function resolveAuditValuesFromAuditable(): array
    {
        $auditableType = $this->auditable_type;
        $modelClass = $auditableType;

        if (!method_exists($modelClass, 'resolveAuditValues')) {
            return [];
        }

        $auditable = $modelClass::find($this->auditable_id);

        if (!$auditable) {
            return [];
        }

        return $auditable->resolveAuditValues($this->resource);
    }
}
