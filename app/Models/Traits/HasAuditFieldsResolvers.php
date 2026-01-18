<?php

namespace App\Models\Traits;

use App\Models\AuditModel;

trait HasAuditFieldsResolvers
{
    protected function getAuditFieldResolvers(): array
    {
        return [];
    }

    public function resolveAuditValues(AuditModel $audit): array
    {
        $resolvers = $this->getAuditFieldResolvers();
        $resolved = [];

        $all_fields = array_unique(array_merge(
            array_keys($audit->old_values ?? []),
            array_keys($audit->new_values ?? [])
        ));

        foreach ($all_fields as $field_key) {
            if (isset($resolvers[$field_key])) {
                $resolver = $resolvers[$field_key];
                $old_value = $audit->old_values[$field_key] ?? null;
                $new_value = $audit->new_values[$field_key] ?? null;

                $resolved[$field_key] = [];

                if ($old_value !== null) {
                    $resolved[$field_key]['old'] = $resolver($old_value);
                }

                if ($new_value !== null) {
                    $resolved[$field_key]['new'] = $resolver($new_value);
                }
            }
        }

        return $resolved;
    }
}
