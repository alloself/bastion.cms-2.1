<template>
    <VDataTableServer
        :headers="module.headers"
        :items="items"
        :items-length="itemsLength"
        :loading="isLoading"
        class="module-list"
        show-select
        v-model="selectedItems"
        v-model:sort-by="tableState.sortBy"
        :multi-sort="{ mode: 'append', modifier: 'alt' }"
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
                    <VHotkey
                        keys="enter"
                        class="module-list__search-hotkey"
                        variant="elevated"
                        platform="auto"
                        @click="handleSearchSubmit"
                    />
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
                    :length="pagesCount"
                    :total-visible="6"
                ></VPagination>
            </div>
        </template>
    </VDataTableServer>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { capitalize, computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { IBaseEntity, IModule, ISortBy, TUUID } from "@/ts/shared/types";
import {
    type ITab,
    useScreenNavigation,
    useScreenStore,
} from "@/ts/features/screen";
import { useModuleListQuery } from "../queries";
import { DEFAULT_PAGINATION_PARAMS } from "../const";

const { module, tab } = defineProps<{
    module: IModule<T>;
    tab: ITab;
}>();

const selectedItems = ref<TUUID[]>([]);

const parseSortByFromUrl = (url: URL) => {
    const sortByParams = url.searchParams.getAll("sortBy[]");

    return sortByParams.reduce<ISortBy[]>((result, param) => {
        const [key, order] = param.split(":");
        if (key && (order === "asc" || order === "desc")) {
            result.push({ key, order });
        }
        return result;
    }, []);
};

const parseQueryTableState = (tab: ITab) => {
    const url = new URL(tab.route, window.location.origin);

    const page = parseInt(url.searchParams.get("page") || String(DEFAULT_PAGINATION_PARAMS.page));
    const perPage = parseInt(url.searchParams.get("per_page") || String(DEFAULT_PAGINATION_PARAMS.perPage));
    const search = url.searchParams.get("search") ?? DEFAULT_PAGINATION_PARAMS.search;
    const sortBy = parseSortByFromUrl(url);

    return {
        page,
        perPage,
        search,
        sortBy,
    };
};

const router = useRouter();
const { toScreenRoute } = useScreenNavigation();

const tableState = reactive(parseQueryTableState(tab));

const searchInput = ref(tableState.search);

const { state, asyncStatus } = useModuleListQuery<T>(module, tableState);

const screenStore = useScreenStore();

const items = computed(() => state.value?.data?.data ?? []);
const itemsLength = computed(() => state.value?.data?.meta?.total ?? 0);
const pagesCount = computed(() => state.value?.data?.meta?.last_page ?? 1);
const isLoading = computed(() => asyncStatus.value === "loading");

const buildQuery = () => {
    const query: Record<string, string | string[]> = {};

    if (tableState.page !== DEFAULT_PAGINATION_PARAMS.page) {
        query.page = String(tableState.page);
    }
    if (tableState.perPage !== DEFAULT_PAGINATION_PARAMS.perPage) {
        query.per_page = String(tableState.perPage);
    }
    if (tableState.search.trim() !== "") {
        query.search = tableState.search.trim();
    }
    if (tableState.sortBy.length) {
        query["sortBy[]"] = tableState.sortBy.map(
            (sort) => `${sort.key}:${sort.order}`
        );
    }

    return query;
};

const syncTableStateToUrl = async () => {
    const currentRoute = router.currentRoute.value;
    const query = buildQuery();
    const queryParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, item));
        } else {
            queryParams.set(key, value);
        }
    });

    const queryString = queryParams.toString();
    const basePath = currentRoute.path;
    const newFullPath = queryString ? `${basePath}?${queryString}` : basePath;

    if (currentRoute.fullPath === newFullPath) {
        return;
    }

    await router.replace({
        path: basePath,
        query,
    });
    screenStore.setActiveTabRoute(router.currentRoute.value);
};

watch(
    () => tableState,
    () => {
        syncTableStateToUrl();
    },
    { deep: true }
);

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
    await toScreenRoute({
        name: `${capitalize(module.key)}Detail`,
        params: { id: item.id },
    });
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
    
    &__search-hotkey {
        cursor: pointer;
        user-select: none;
    }
}
</style>
