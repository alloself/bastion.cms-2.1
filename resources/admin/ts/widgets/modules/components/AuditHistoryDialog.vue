<template>
    <VDialog v-model="showDialog" width="auto" scrollable>
        <VCard>
            <VCardTitle>История изменений</VCardTitle>
            <VCardText>
                <v-expansion-panels>
                    <v-expansion-panel
                        v-for="i in 3"
                        :key="i"
                        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                        title="Item"
                    ></v-expansion-panel>
                </v-expansion-panels>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { computed } from 'vue'

import type { IBSmartFormField, IBaseEntity, TAuditModelWithResolved } from '@/ts/shared'

const { audits = [], fields = [], ignoredFields = ['id','_lft','_rgt'] } = defineProps<{
    audits: TAuditModelWithResolved[]
    fields: IBSmartFormField[]
    ignoredFields?: string[]
}>()

const showDialog = defineModel<boolean>('modelValue', { required: true })

const fieldMap = computed(() => {
    return fields.reduce<Record<string, IBSmartFormField>>((acc, field) => {
        acc[field.key] = field
        return acc
    }, {})
})

const getFieldLabel = (key: string) => {
    const field = fieldMap.value[key]
    if (!field || !field.props?.label) {
        return key
    }
    return field.props.label
}
</script>

<style lang="scss" scoped></style>
