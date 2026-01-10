<template>
    <div
        class="b-json-editor"
        :class="{
            'b-json-editor--has-errors': normalizedErrorMessages.length > 0,
            'b-json-editor--readonly': readonly,
        }"
    >
        <VDataTable
            :headers="tableHeaders"
            :items="rows"
            item-value="id"
            class="b-json-editor__table"
            density="compact"
            hide-default-footer
            :items-per-page="-1"
        >
            <template v-if="label" #top>
                <div class="b-json-editor__label">
                    <VIcon size="small" icon="mdi-code-json" class="mr-2"></VIcon>
                    <span>{{ label }}</span>
                </div>
            </template>

            <template #item.key="{ item }">
                <VTextField
                    :model-value="item.key"
                    @update:model-value="(newValue: string) => handleUpdateRow(item.id, 'key', newValue)"
                    density="compact"
                    variant="outlined"
                    placeholder="Введите ключ"
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

            <template #bottom>
                <div v-if="!readonly" class="b-json-editor__actions">
                    <VTooltip location="top" text="Добавить поле">
                        <template #activator="{ props: activatorProps }">
                            <VBtn
                                icon
                                size="x-small"
                                variant="flat"
                                color="primary"
                                v-bind="activatorProps"
                                @click="handleAddRow"
                            >
                                <VIcon>mdi-plus</VIcon>
                            </VBtn>
                        </template>
                    </VTooltip>
                </div>
            </template>
        </VDataTable>

        <ul
            v-if="normalizedErrorMessages.length > 0"
            class="b-json-editor__errors"
        >
            <li
                v-for="(
                    errorMessage, errorMessageIndex
                ) in normalizedErrorMessages"
                :key="errorMessageIndex"
                class="b-json-editor__error"
            >
                {{ errorMessage }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TBJSONEditorProps, TJSONEditorRow } from "./BJSONEditor.types";

const {
    modelValue = "",
    readonly = false,
    errorMessages,
    label,
} = defineProps<TBJSONEditorProps>();

const emits = defineEmits<{
    "update:modelValue": [value: string];
}>();

const generateRowId = (): string => {
    return crypto.randomUUID();
};

const parseFromJson = (jsonString?: string): TJSONEditorRow[] => {
    if (!jsonString || jsonString.trim() === "") {
        return [];
    }

    try {
        const parsed = JSON.parse(jsonString);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            return [];
        }

        return Object.entries(parsed).map(([key, value]) => ({
            id: generateRowId(),
            key,
            value: String(value ?? ""),
        }));
    } catch {
        return [];
    }
};

const rows = ref<TJSONEditorRow[]>(parseFromJson(modelValue ?? ""));

const tableHeaders = [
    { title: "Ключ", key: "key", sortable: false },
    { title: "Значение", key: "value", sortable: false },
    { title: "Действия", key: "actions", sortable: false, width: "60px" },
];

const normalizedErrorMessages = computed<string[]>(() => {
    if (!errorMessages) {
        return [];
    }
    if (Array.isArray(errorMessages)) {
        return errorMessages;
    }
    return [errorMessages];
});

const serializeToJson = (rowsData: TJSONEditorRow[]): string => {
    const result: Record<string, string> = {};

    for (const row of rowsData) {
        if (row.key.trim() !== "") {
            result[row.key] = row.value;
        }
    }

    return JSON.stringify(result);
};

const emitUpdate = () => {
    const jsonString = serializeToJson(rows.value);
    emits("update:modelValue", jsonString);
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

watch(
    () => modelValue,
    (nextModelValue) => {
        const currentJson = serializeToJson(rows.value);
        const nextJson = nextModelValue ?? "";

        if (currentJson === nextJson) {
            return;
        }
        rows.value = parseFromJson(nextJson);
    }
);
</script>

<style scoped lang="scss">
.b-json-editor {
    width: 100%;

    &__label {
        padding: 8px 16px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    &__table {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
    }

    &__input {
        margin: 4px 0;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    &__errors {
        margin: 8px 0 0;
        padding: 0;
        list-style: none;
        color: rgb(var(--v-theme-error));
        font-size: 0.75rem;
    }

    &__error {
        margin: 2px 0 0;
    }

    &--has-errors {
        .b-json-editor__table {
            border-color: rgb(var(--v-theme-error));
        }
    }
}
</style>
