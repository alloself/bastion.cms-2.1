<template>
    <VDataTableServer
        :headers="module.headers"
        :items="items"
        :items-length="itemsLength"
        :loading="isLoading"
        class="module-list"
        show-select
        v-model="selectedItems"
        density="compact"
        @click:row="handleRowClick"
        striped="even"
    >
        <template #top>
            <VTextField
                v-model="searchInput"
                class="module-list__search"
                variant="filled"
                rounded="0"
                density="compact"
                clearable
                hide-details
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-keyboard-return"
                placeholder="Поиск"
                @keydown.enter.prevent="handleSearchSubmit"
                @click:append-inner="handleSearchSubmit"
                @click:clear="handleClearSearch"
            >
                <template #append-inner>
                    <VHotkey keys="enter" variant="elevated" platform="auto" />
                </template>
            </VTextField>
        </template>
        <template #loading>
            <VSkeletonLoader type="table-row@20" />
        </template>
        <template #no-data>
            <VEmptyState
                class="module-list__no-data"
                icon="mdi-database-off-outline"
                :title="noDataTitle"
                :text="noDataText"
                justify="center"
            >
                <template #actions>
                    <div class="module-list__no-data-actions">
                        <VBtn
                            size="small"
                            variant="outlined"
                            color="primary"
                            @click="handleCreateClick"
                        >
                            Создать
                        </VBtn>
                        <VBtn
                            v-if="tableState.search.trim() !== ''"
                            size="small"
                            variant="text"
                            @click="handleClearSearch"
                        >
                            Сбросить поиск
                        </VBtn>
                    </div>
                </template>
            </VEmptyState>
        </template>
        <template #bottom>
            <VDivider role="separator"></VDivider>
            <div class="v-data-table-footer module-list__footer">
                <VTooltip location="top" text="Создать" color="primary">
                    <template #activator="{ props }">
                        <VBtn
                            icon
                            size="small"
                            v-bind="props"
                            :loading="isLoading"
                            class="mr-2"
                            flat
                            :to="{ name: `${capitalize(module.key)}Create` }"
                        >
                            <VIcon size="small">mdi-plus</VIcon>
                        </VBtn>
                    </template>
                    <span>Создать</span>
                </VTooltip>
                <VTooltip
                    location="top"
                    text="Удалить выбранное"
                    color="primary"
                >
                    <template #activator="{ props }">
                        <VBtn
                            icon
                            size="small"
                            :loading="isLoading"
                            v-bind="props"
                            flat
                            @click="onDelete"
                        >
                            <VIcon size="small">mdi-delete</VIcon>
                        </VBtn>
                    </template>
                    <span>Удалить выбранное</span>
                </VTooltip>

                <VSpacer></VSpacer>
                <VSelect
                    density="compact"
                    class="module-list__per-page"
                    v-model="tableState.perPage"
                    hide-details
                    :items="[5, 10, 15, 25, 50, 100]"
                ></VSelect>
                <VPagination
                    density="compact"
                    rounded="circle"
                    :showFirstLastPag="true"
                    v-model="tableState.page"
                    :length="itemsLength"
                    :total-visible="6"
                ></VPagination>
            </div>
        </template>
    </VDataTableServer>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { capitalize, computed, reactive, ref } from "vue";
import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "../../types";
import type { ITab } from "@/ts/features/screen";
import { useModuleListQuery } from "../queries";
import { toScreenRoute } from "../../helpers";

const { module, tab } = defineProps<{
    module: IModule<T>;
    tab: ITab;
}>();

const selectedItems = ref<TUUID[]>([]);

const parseQueryTableState = (tab: ITab) => {
    const url = new URL(tab.route, window.location.origin);

    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "10");
    const search = url.searchParams.get("search") ?? "";

    return {
        page,
        perPage,
        search,
    };
};

const tableState = reactive(parseQueryTableState(tab));

const searchInput = ref("");

const { state, asyncStatus } = useModuleListQuery<T>(module, tableState);

const items = computed(() => state.value?.data?.data ?? []);
const itemsLength = computed(() => state.value?.data?.meta?.total ?? 0);
const isLoading = computed(() => asyncStatus.value === "loading");

const handleSearchSubmit = () => {
    tableState.search = searchInput.value.trim();
};

const handleClearSearch = () => {
    searchInput.value = "";
    tableState.search = "";
};

const noDataTitle = computed(() => {
    if (tableState.search.trim() !== "") {
        return "Ничего не найдено";
    }
    return "Пока здесь пусто";
});

const noDataText = computed(() => {
    if (tableState.search.trim() !== "") {
        return "Попробуйте изменить запрос или сбросить поиск.";
    }
    return "Создайте первую запись или попробуйте позже.";
});

const handleCreateClick = (event: MouseEvent) => {
    toScreenRoute({ name: `${capitalize(module.key)}Create` }, event);
};

const handleRowClick = async (_event: MouseEvent, { item }: { item: T }) => {
    await toScreenRoute({ name: `${capitalize(module.key)}Detail`, params: { id: item.id } });
};

const onDelete = () => {
    console.log(selectedItems.value);
};
</script>

<style scoped lang="scss">
.module-list {
    height: calc(100svh - 96px);

    &__search {
        flex: 0 0 auto;
    }

    &__no-data {
        padding: 24px 16px;
    }

    &__no-data-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    &__per-page {
        max-width: 92px;

        :deep(.v-field) {
            box-shadow: none;
        }
    }
}
</style>
