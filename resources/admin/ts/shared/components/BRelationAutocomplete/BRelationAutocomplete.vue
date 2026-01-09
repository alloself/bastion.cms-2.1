<template>
    <VAutocomplete
        class="b-relation-autocomplete"
        :model-value="modelValue"
        :items="items"
        :item-title="itemTitle"
        :item-value="itemValue"
        :label="label"
        :placeholder="placeholder"
        :readonly="readonly"
        :loading="isLoading"
        :error-messages="errorMessages"
        :no-data-text="noDataText"
        density="compact"
        variant="filled"
        rounded="0"
        clearable
        @update:model-value="handleUpdateModelValue"
        @update:search="handleSearchUpdate"
    >
        <template #prepend>
            <VTooltip location="top" text="Редактировать" color="primary">
                <template #activator="{ props: activatorProps }">
                    <VBtn
                        icon
                        size="small"
                        variant="tonal"
                        class="mr-2"
                        v-bind="activatorProps"
                        :disabled="readonly || !modelValue"
                        @click="handleEditClick($event)"
                    >
                        <VIcon size="small">mdi-pencil</VIcon>
                    </VBtn>
                </template>
            </VTooltip>
            <VTooltip location="top" text="Создать" color="primary">
                <template #activator="{ props: activatorProps }">
                    <VBtn
                        icon
                        size="small"
                        variant="tonal"
                        v-bind="activatorProps"
                        :disabled="readonly"
                        @click="handleCreateClick($event)"
                    >
                        <VIcon size="small">mdi-plus</VIcon>
                    </VBtn>
                </template>
            </VTooltip>
        </template>
    </VAutocomplete>
</template>

<script setup lang="ts">
import { capitalize, computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";
import { useRelationSearch } from "@/ts/shared/composables";
import { useScreenNavigation } from "@/ts/features/screen";
import type { TBRelationAutocompleteProps } from "./BRelationAutocomplete.types";
import type { IBaseEntity } from "@/ts/shared/types";

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_ITEM_TITLE = "name";
const DEFAULT_ITEM_VALUE = "id";

const {
    modelValue,
    endpoint,
    itemTitle = DEFAULT_ITEM_TITLE,
    itemValue = DEFAULT_ITEM_VALUE,
    label,
    placeholder,
    readonly = false,
    loading = false,
    errorMessages,
    debounceMs = DEFAULT_DEBOUNCE_MS,
} = defineProps<TBRelationAutocompleteProps>();

const emits = defineEmits<{
    "update:modelValue": [value: string | undefined];
}>();

const { toScreenRoute } = useScreenNavigation();

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, debounceMs);

const { data: searchResults, asyncStatus } = useRelationSearch<IBaseEntity>(
    endpoint,
    debouncedSearch
);

const items = computed(() => searchResults.value?.data ?? []);

const isLoading = computed(() => loading || asyncStatus.value === "loading");

const noDataText = computed(() => {
    if (asyncStatus.value === "loading") {
        return "Загрузка...";
    }
    return "Ничего не найдено";
});

const handleUpdateModelValue = (value: string | null) => {
    emits("update:modelValue", value ?? undefined);
};

const handleSearchUpdate = (value: string = "") => {
    searchInput.value = value;
};

const handleEditClick = async (event: MouseEvent) => {
    if (!modelValue) {
        return;
    }
    await toScreenRoute(
        {
            name: `${capitalize(endpoint)}Detail`,
            params: { id: modelValue },
        },
        event
    );
};

const handleCreateClick = async (event: MouseEvent) => {
    await toScreenRoute(
        {
            name: `${capitalize(endpoint)}Create`,
        },
        event
    );
};
</script>