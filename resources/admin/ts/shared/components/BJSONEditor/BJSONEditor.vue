<template>
    <BTableLikeFieldWrapper
        :label="label"
        label-icon="mdi-code-json"
        :readonly="readonly"
        :has-errors="normalizedErrorMessages.length > 0"
        :error-messages="normalizedErrorMessages"
    >
        <VDataTable
            :headers="tableHeaders"
            :items="rows"
            item-value="id"
            class="b-json-editor__table"
            density="compact"
            hide-default-footer
            no-data-text="Нет данных"
            :items-per-page="-1"
        >
            <template #item.key="{ item }">
                <VTextField
                    :model-value="item.key"
                    @update:model-value="(newValue: string) => handleUpdateRow(item.id, 'key', newValue)"
                    @blur="() => handleKeyBlur(item.id, item.key)"
                    density="compact"
                    variant="outlined"
                    placeholder="Введите ключ"
                    :error="isDuplicateKey(item.id, item.key)"
                    hide-details
                    :readonly="readonly"
                    class="b-json-editor__input"
                />
            </template>

            <template #item.value="{ item }">
                <VTextField
                    :model-value="item.value"
                    @update:model-value="(newValue: string) => handleUpdateRow(item.id, 'value', newValue)"
                    density="compact"
                    variant="outlined"
                    placeholder="Введите значение"
                    hide-details
                    :readonly="readonly"
                    class="b-json-editor__input"
                />
            </template>

            <template #item.actions="{ item }">
                <VBtn
                    v-if="!readonly"
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click="handleRemoveRow(item.id)"
                >
                    <VIcon>mdi-delete</VIcon>
                </VBtn>
            </template>
        </VDataTable>

        <template #actions>
            <VTooltip v-if="!readonly" location="top" text="Добавить поле">
                <template #activator="{ props: activatorProps }">
                    <VBtn
                        icon="mdi-plus"
                        size="x-small"
                        variant="flat"
                        color="primary"
                        v-bind="activatorProps"
                        @click="handleAddRow"
                    />
                </template>
            </VTooltip>
        </template>
    </BTableLikeFieldWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { isEqual, isPlainObject } from "lodash";
import type { TBJSONEditorProps, TJSONEditorRow, TJSONEditorValue } from "./BJSONEditor.types";
import { useNormalizedErrors } from "@/ts/shared/composables";
import BTableLikeFieldWrapper from "@/ts/shared/components/BTableLikeFieldWrapper/BTableLikeFieldWrapper.vue";

const {
    modelValue = null,
    readonly = false,
    errorMessages,
    label,
} = defineProps<TBJSONEditorProps>();

const emits = defineEmits<{
    "update:modelValue": [value: TJSONEditorValue];
}>();

const generateRowId = (): string => {
    return crypto.randomUUID();
};

const parseFromObject = (value: TJSONEditorValue): TJSONEditorRow[] => {
    if (!value || !isPlainObject(value)) {
        return [];
    }

    return Object.entries(value).map(([key, rowValue]) => ({
        id: generateRowId(),
        key,
        value: String(rowValue ?? ""),
    }));
};

const rows = ref<TJSONEditorRow[]>(parseFromObject(modelValue));

const tableHeaders = [
    { title: "Ключ", key: "key", sortable: false },
    { title: "Значение", key: "value", sortable: false },
    { title: "Действия", key: "actions", sortable: false, width: "60px" },
];

const normalizedErrorMessages = useNormalizedErrors(() => errorMessages);

const isDuplicateKey = (rowId: string, key: string): boolean => {
    const trimmedKey = key.trim();
    if (trimmedKey === "") {
        return false;
    }
    const firstRowWithSameKey = rows.value.find(row => row.key.trim() === trimmedKey);
    return firstRowWithSameKey !== undefined && firstRowWithSameKey.id !== rowId;
};

const serializeToObject = (rowsData: TJSONEditorRow[]): TJSONEditorValue => {
    const result: Record<string, string> = {};

    for (const row of rowsData) {
        if (row.key.trim() !== "") {
            result[row.key] = row.value;
        }
    }

    return Object.keys(result).length ? result : {};
};

const emitUpdate = () => {
    const value = serializeToObject(rows.value);
    emits("update:modelValue", value);
};

const handleAddRow = () => {
    rows.value.push({
        id: generateRowId(),
        key: "",
        value: "",
    });
    emitUpdate();
};

const handleRemoveRow = (rowId: string) => {
    const rowIndex = rows.value.findIndex(({ id }) => id === rowId);
    if (rowIndex !== -1) {
        rows.value.splice(rowIndex, 1);
        emitUpdate();
    }
};

const handleUpdateRow = (
    rowId: string,
    field: "key" | "value",
    newValue: string
) => {
    const row = rows.value.find(({ id }) => id === rowId);
    if (row) {
        row[field] = newValue;
        emitUpdate();
    }
};

const handleKeyBlur = (rowId: string, key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
        return;
    }
    const duplicateRowIndex = rows.value.findIndex(
        row => row.id !== rowId && row.key.trim() === trimmedKey
    );
    if (duplicateRowIndex !== -1) {
        rows.value.splice(duplicateRowIndex, 1);
        emitUpdate();
    }
};

watch(
    () => modelValue,
    (nextModelValue) => {
        const currentObject = serializeToObject(rows.value);

        if (isEqual(currentObject, nextModelValue)) {
            return;
        }
        rows.value = parseFromObject(nextModelValue);
    }
);
</script>

<style scoped lang="scss">
.b-json-editor {
    &__table {
        border: none;
    }

    &__input {
        margin: 4px 0;
    }
}
</style>
