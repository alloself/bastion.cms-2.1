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
        <template #append-item>
            <div
                v-if="hasMore"
                v-intersect="handleIntersect"
                class="b-relation-autocomplete__load-more"
            >
                <VProgressCircular
                    v-if="isLoadingMore"
                    indeterminate
                    size="24"
                    width="2"
                />
            </div>
        </template>
    </VAutocomplete>
</template>

<script setup lang="ts">
import { capitalize, computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";
import { useInfiniteRelationSearch } from "@/ts/shared/composables";
import { useScreenNavigation } from "@/ts/features/screen";
import type { TBRelationAutocompleteProps } from "./BRelationAutocomplete.types";
import type { IBaseEntity } from "../..";

const {
    modelValue,
    endpoint,
    itemTitle = 'name',
    itemValue = 'id',
    label,
    placeholder,
    readonly = false,
    loading = false,
    errorMessages,
    debounceMs = 300,
    relations = [],
} = defineProps<TBRelationAutocompleteProps>();

const emits = defineEmits<{
    "update:modelValue": [value: string | undefined];
}>();

const { toScreenRoute } = useScreenNavigation();

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, debounceMs);

const {
    items,
    hasMore,
    isLoadingMore,
    isInitialLoading,
    loadMore,
} = useInfiniteRelationSearch<IBaseEntity>(endpoint, debouncedSearch, relations);

const isLoading = computed(
    () => loading || isInitialLoading.value
);

const noDataText = computed(() => {
    if (isInitialLoading.value) {
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

const handleIntersect = (isIntersecting: boolean) => {
    if (isIntersecting) {
        loadMore();
    }
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

<style scoped lang="scss">
.b-relation-autocomplete {
    &__load-more {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        min-height: 40px;
    }
}
</style>