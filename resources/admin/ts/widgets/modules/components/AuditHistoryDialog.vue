<template>
    <VDialog v-model="showDialog"> </VDialog>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { IBaseEntity, IModuleForm, TAuditModelWithResolved } from '@/ts/shared'

const props = defineProps<{
    audits: TAuditModelWithResolved[]
    formContext: IModuleForm<T>
}>()

const showDialog = defineModel<boolean>('modelValue', { required: true })
</script>

<style lang="scss" scoped></style>
