<template>
    <VDialog v-model="showDialog" width="800" max-width="95vw" scrollable>
        <VCard class="audit-history-dialog">
            <VCardTitle class="audit-history-dialog__title">
                <span class="audit-history-dialog__title-text">История изменений</span>
                <VTextField
                    v-model="searchInput"
                    class="audit-history-dialog__search"
                    density="compact"
                    variant="filled"
                    rounded="0"
                    clearable
                    hide-details
                    placeholder="Поиск по email пользователя"
                    prepend-inner-icon="mdi-magnify"
                />
                <VBtn
                    icon
                    variant="text"
                    size="small"
                    class="audit-history-dialog__close"
                    @click="showDialog = false"
                >
                    <VIcon>mdi-close</VIcon>
                </VBtn>
            </VCardTitle>
            <VCardText class="audit-history-dialog__content">
                <div v-if="isInitialLoading" class="audit-history-dialog__loading">
                    <VProgressCircular indeterminate size="48" width="2" />
                    <span class="audit-history-dialog__loading-text">Загрузка...</span>
                </div>
                <VEmptyState
                    v-else-if="audits.length === 0"
                    class="audit-history-dialog__empty"
                    icon="mdi-history"
                    :title="emptyStateTitle"
                    :text="emptyStateText"
                    justify="center"
                />
                <template v-else>
                    <VExpansionPanels variant="accordion" flat>
                        <VExpansionPanel
                            v-for="audit in audits"
                            :key="audit.id"
                            class="audit-history-dialog__panel"
                            elevation="0"
                        >
                            <VExpansionPanelTitle class="audit-history-dialog__panel-title">
                                <div class="audit-history-dialog__panel-header">
                                    <span class="audit-history-dialog__panel-date">
                                        {{ formatDate(audit.created_at) }}
                                    </span>
                                    <VChip
                                        size="small"
                                        :color="getEventColor(audit.event)"
                                        class="audit-history-dialog__panel-event"
                                    >
                                        {{ getEventLabel(audit.event) }}
                                    </VChip>
                                    <span class="audit-history-dialog__panel-user">
                                        {{ getUserEmail(audit) }}
                                    </span>
                                </div>
                            </VExpansionPanelTitle>
                            <VExpansionPanelText>
                                <VDataTable
                                    density="compact"
                                    class="audit-history-dialog__table"
                                    :headers="tableHeaders"
                                    :items="getChangedFields(audit)"
                                    item-value="key"
                                    :items-per-page="-1"
                                    hide-default-footer
                                >
                                    <template #item.oldValue="{ value }">
                                        <span class="audit-history-dialog__table-cell--old">
                                            {{ value }}
                                        </span>
                                    </template>
                                    <template #item.newValue="{ value }">
                                        <span class="audit-history-dialog__table-cell--new">
                                            {{ value }}
                                        </span>
                                    </template>
                                </VDataTable>
                            </VExpansionPanelText>
                    </VExpansionPanel>
                    </VExpansionPanels>
                    <div
                        v-if="hasMore"
                        v-intersect="handleIntersect"
                        class="audit-history-dialog__load-more"
                    >
                        <VProgressCircular v-if="isLoadingMore" indeterminate size="24" width="2" />
                    </div>
                </template>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'

import { useAuditHistoryQuery } from '@/ts/shared/composables'
import type { IBSmartFormField, IBaseEntity, TAuditModelWithResolved } from '@/ts/shared'

interface IChangedField {
    key: string
    label: string
    oldValue: string
    newValue: string
}

const { modelKey, entityId, fields = [], ignoredFields = ['id', '_lft', '_rgt'] } = defineProps<{
    modelKey: string
    entityId: string
    fields: IBSmartFormField[]
    ignoredFields?: string[]
}>()

const showDialog = defineModel<boolean>('modelValue', { required: true })

const searchInput = ref<string>('')
const debouncedSearch = refDebounced(searchInput, 300)

const { items: audits, hasMore, isLoadingMore, isInitialLoading, loadMore } = useAuditHistoryQuery(
    () => modelKey,
    () => entityId,
    debouncedSearch,
    () => showDialog.value,
)

const fieldMap = computed(() => {
    return fields.reduce<Record<string, IBSmartFormField>>((acc, field) => {
        acc[field.key] = field
        return acc
    }, {})
})

const tableHeaders = [
    { title: 'Поле', key: 'label', sortable: false },
    { title: 'Старое значение', key: 'oldValue', sortable: false },
    { title: 'Новое значение', key: 'newValue', sortable: false },
]

const formatDate = (dateString?: string | null) => {
    if (!dateString) {
        return '—'
    }
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU')
}

const getEventLabel = (event: string) => {
    switch (event) {
        case 'created':
            return 'Создано'
        case 'updated':
            return 'Изменено'
        case 'deleted':
            return 'Удалено'
        case 'restored':
            return 'Восстановлено'
        default:
            return event
    }
}

const getEventColor = (event: string) => {
    switch (event) {
        case 'created':
            return 'success'
        case 'updated':
            return 'info'
        case 'deleted':
            return 'error'
        case 'restored':
            return 'warning'
        default:
            return 'grey'
    }
}

const getFieldLabel = (key: string) => {
    const field = fieldMap.value[key]
    if (!field || !field.props?.label) {
        return key
    }
    return String(field.props.label)
}

const formatValue = (value: unknown) => {
    if (!value) {
        return '—'
    }
    if (typeof value === 'boolean') {
        return value ? 'Да' : 'Нет'
    }
    if (typeof value === 'object') {
        return JSON.stringify(value)
    }
    return String(value)
}

const getChangedFields = (audit: TAuditModelWithResolved): IChangedField[] => {
    const oldKeys = Object.keys(audit.old_values ?? {})
    const newKeys = Object.keys(audit.new_values ?? {})
    const uniqueKeys = [...new Set([...oldKeys, ...newKeys])]

    return uniqueKeys.reduce<IChangedField[]>((acc, key) => {
        if (ignoredFields.includes(key)) {
            return acc
        }

        const resolved = audit.resolved_values?.[key]

        acc.push({
            key,
            label: getFieldLabel(key),
            oldValue: resolved?.old ?? formatValue(audit.old_values?.[key]),
            newValue: resolved?.new ?? formatValue(audit.new_values?.[key]),
        })

        return acc
    }, [])
}

const getUserEmail = (audit: TAuditModelWithResolved) => {
    return audit.user?.email ?? 'Система'
}

const handleIntersect = (isIntersecting: boolean) => {
    if (isIntersecting) {
        loadMore()
    }
}

const emptyStateTitle = computed(() => {
    const search = (searchInput.value ?? '').trim()
    return search !== '' ? 'Ничего не найдено' : 'История изменений пуста'
})

const emptyStateText = computed(() => {
    const search = (searchInput.value ?? '').trim()
    return search !== ''
        ? 'Попробуйте изменить параметры поиска'
        : 'Изменения по этой записи пока не зафиксированы'
})
</script>

<style lang="scss" scoped>
.audit-history-dialog {
    display: flex;
    flex-direction: column;
    max-height: 80vh;

    &__title {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }

    &__title-text {
        flex-shrink: 0;
    }

    &__search {
        flex: 1 1 auto;
        min-width: 0;
    }

    &__close {
        flex-shrink: 0;
    }

    &__content {
        overflow-y: auto;
        flex: 1 1 auto;
        min-height: 0;
    }

    &__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 200px;
    }

    &__loading-text {
        color: rgba(var(--v-theme-on-surface), 0.6);
        font-size: 0.875rem;
    }

    &__empty {
        min-height: 200px;
    }

    &__load-more {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        min-height: 40px;
    }

    &__panel-header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
        overflow: hidden;
    }

    &__panel-date {
        font-weight: 500;
        min-width: 140px;
    }

    &__panel-event {
        flex-shrink: 0;
    }

    &__panel-user {
        color: rgba(var(--v-theme-on-surface), 0.6);
        font-size: 0.875rem;
        margin-left: auto;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    &__panel {
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }

    &__table {
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
        border-radius: 4px;
    }

    &__table-cell {
        &--old {
            color: rgba(var(--v-theme-error), 0.8);
        }

        &--new {
            color: rgba(var(--v-theme-success), 0.8);
        }
    }
}
</style>
