<template>
    <div class="module-list">
        <VDataTableServer
            class="module-list__table"
            :headers="moduleValue.headers"
            :items="items"
            :items-length="itemsLength"
            :loading="isTableLoading"
            fixed-header
            fixed-footer
            show-select
            density="compact"
            select-strategy="page"
            v-model="selectedEntityIds"
            :page="tableState.page"
            :items-per-page="tableState.perPage"
            :sort-by="tableState.sortBy"
            @update:options="handleOptionsUpdate"
            @click:row="handleRowClick"
        >
            <template #top>
                <div class="module-list__toolbar">
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
                    <template #["append-inner"]>
                        <VHotkey keys="enter" variant="elevated" platform="auto" />
                    </template>
                    </VTextField>
                </div>
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
                    :size="128"
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
                <VCardActions class="module-list__footer d-flex flex-column pa-0">
                    <VDivider role="separator" />
                    <VSlideGroup
                        class="module-list__footer-actions"
                        content-class="module-list__footer-container"
                        show-arrows
                    >
                        <VTooltip location="top" text="Создать" color="primary">
                            <template #activator="{ props }">
                                <VBtn
                                    icon
                                    size="x-small"
                                    v-bind="props"
                                    class="mr-2"
                                    variant="flat"
                                    @click="handleCreateClick"
                                >
                                    <VIcon>mdi-plus</VIcon>
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
                                    size="x-small"
                                    v-bind="props"
                                    variant="flat"
                                    :loading="isFooterActionLoading"
                                    :disabled="isDeleteSelectedDisabled"
                                    @click="handleDeleteSelected"
                                >
                                    <VIcon>mdi-delete</VIcon>
                                </VBtn>
                            </template>
                            <span>Удалить выбранное</span>
                        </VTooltip>

                        <VSpacer />

                        <VSelect
                            density="compact"
                            class="per-page-counter module-list__per-page elevation-0"
                            variant="filled"
                            rounded="0"
                            hide-details
                            :items="itemsPerPageOptions"
                            :model-value="tableState.perPage"
                            :disabled="isTableLoading"
                            @update:model-value="handlePerPageChange"
                        />

                        <VPagination
                            density="compact"
                            rounded="circle"
                            show-first-last-page
                            :model-value="tableState.page"
                            :length="lastPage"
                            :total-visible="6"
                            :disabled="isTableLoading"
                            @update:model-value="handlePageChange"
                        />
                    </VSlideGroup>
                </VCardActions>
            </template>
        </VDataTableServer>
    </div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { IBaseEntity } from "@admin/ts/types";
import type {
    ISortBy,
    IVuetifyTableOptions,
    IModuleListParams,
} from "@admin/ts/types";
import type { IModule } from "@admin/ts/shared/modules";
import type { IModuleListQueryParams } from "@admin/ts/shared/modules/api";
import { useModuleListQuery } from "@admin/ts/shared/modules/queries";
import {
    parseIntegerParam,
    parseSortByParam,
    toScreenRoute,
} from "@admin/ts/shared/helpers";
import { useScreenStore } from "@admin/ts/features/screen";
import { isPlainRecord } from "@admin/ts/shared/typeGuards";
import { computed, ref, watch, capitalize } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
    module: IModule;
    tabFullPath: string;
}>();

const router = useRouter();
const screenStore = useScreenStore();

const defaultTableState: IModuleListParams = {
    page: 1,
    perPage: 10,
    sortBy: [],
    search: "",
};

const parseTableStateFromFullPath = (fullPath: string): IModuleListParams => {
    try {
        const url = new URL(fullPath, import.meta.env.BASE_URL);

        const page = parseIntegerParam(
            url.searchParams.get("page"),
            defaultTableState.page
        );
        const perPage = parseIntegerParam(
            url.searchParams.get("per_page"),
            defaultTableState.perPage
        );
        const search = url.searchParams.get("search") ?? "";

        const sortByValues = url.searchParams.getAll("sortBy[]");
        const sortBy: ISortBy[] = [];
        sortByValues.forEach((sortByValue) => {
            const sortItem = parseSortByParam(sortByValue);
            if (sortItem) {
                sortBy.push(sortItem);
            }
        });

        return {
            page,
            perPage,
            sortBy,
            search,
        };
    } catch (error) {
        return {
            ...defaultTableState,
            sortBy: [...defaultTableState.sortBy],
        };
    }
};

const normalizeSortBy = (value: ISortBy[]): ISortBy[] => {
    return value.filter((sortItem) => {
        if (sortItem.key.trim() === "") {
            return false;
        }
        return sortItem.order === "asc" || sortItem.order === "desc";
    });
};

const normalizeTableState = (state: IModuleListParams): IModuleListParams => {
    return {
        page: state.page < 1 ? defaultTableState.page : state.page,
        perPage: state.perPage < 1 ? defaultTableState.perPage : state.perPage,
        sortBy: normalizeSortBy(state.sortBy),
        search: state.search,
    };
};

const buildFullPathWithState = (
    baseFullPath: string,
    state: IModuleListParams
): string => {
    const url = new URL(baseFullPath, import.meta.env.BASE_URL);
    const searchParams = new URLSearchParams(url.search);

    const normalizedState = normalizeTableState(state);

    searchParams.set("page", normalizedState.page.toString());
    searchParams.set("per_page", normalizedState.perPage.toString());

    searchParams.delete("sortBy[]");
    normalizedState.sortBy.forEach((sortItem) => {
        searchParams.append("sortBy[]", `${sortItem.key}:${sortItem.order}`);
    });

    const normalizedSearchValue = normalizedState.search.trim();
    if (normalizedSearchValue === "") {
        searchParams.delete("search");
    } else {
        searchParams.set("search", normalizedSearchValue);
    }

    const nextQueryString = searchParams.toString();
    const nextPath = nextQueryString
        ? `${url.pathname}?${nextQueryString}`
        : url.pathname;

    return url.hash ? `${nextPath}${url.hash}` : nextPath;
};

const tableState = computed(() =>
    parseTableStateFromFullPath(props.tabFullPath)
);

const moduleValue = computed(() => props.module);

const queryParams = computed<IModuleListQueryParams>(() => {
    const normalizedState = normalizeTableState(tableState.value);
    const baseParams: IModuleListQueryParams = {
        page: normalizedState.page,
        per_page: normalizedState.perPage,
    };

    if (normalizedState.sortBy.length > 0) {
        baseParams.sortBy = normalizedState.sortBy;
    }
    if (normalizedState.search.trim() !== "") {
        baseParams.search = normalizedState.search.trim();
    }

    return baseParams;
});

const listQuery = useModuleListQuery<T>({
    module: moduleValue,
    queryParams,
});

const items = computed(() => listQuery.data.value?.data ?? []);
const itemsLength = computed(() => listQuery.data.value?.meta.total ?? 0);
const lastPage = computed(() => listQuery.data.value?.meta.last_page ?? 1);
const isTableLoading = computed(() => {
    return listQuery.isLoading.value || listQuery.isPending.value;
});

const noDataTitle = computed(() => {
    if (tableState.value.search.trim() !== "") {
        return "Ничего не найдено";
    }
    return "Пока здесь пусто";
});

const noDataText = computed(() => {
    if (tableState.value.search.trim() !== "") {
        return "Попробуйте изменить запрос или сбросить поиск.";
    }
    return "Создайте первую запись или попробуйте позже.";
});

const selectedEntityIds = ref<string[]>([]);

const itemsPerPageOptions = [5, 10, 15, 25, 50, 100];

const isFooterActionLoading = computed(() => {
    return listQuery.isDeleting.value || listQuery.isDeletingBatch.value;
});

const isDeleteSelectedDisabled = computed(() => {
    return selectedEntityIds.value.length === 0 || isFooterActionLoading.value;
});

const replaceUrlForActiveTab = async (nextFullPath: string) => {
    const currentFullPath = router.currentRoute.value.fullPath;
    if (currentFullPath !== nextFullPath) {
        await router.replace(nextFullPath);
    }
    screenStore.setActiveScreenTabRoute(router.currentRoute.value);
};

const patchUrlState = async (patch: Partial<IModuleListParams>) => {
    const nextState: IModuleListParams = {
        ...tableState.value,
        ...patch,
    };
    const nextFullPath = buildFullPathWithState(props.tabFullPath, nextState);
    await replaceUrlForActiveTab(nextFullPath);
};

const searchInput = ref(tableState.value.search);

watch(
    () => tableState.value.search,
    (nextSearchValue) => {
        if (searchInput.value !== nextSearchValue) {
            searchInput.value = nextSearchValue;
        }
    }
);

const handleSearchSubmit = () => {
    const normalizedSearchValue = searchInput.value.trim();
    const currentSearchValue = tableState.value.search.trim();
    if (normalizedSearchValue === currentSearchValue) {
        return;
    }

    patchUrlState({ search: normalizedSearchValue, page: 1 });
};

const handleClearSearch = () => {
    if (searchInput.value !== "") {
        searchInput.value = "";
    }
    patchUrlState({ search: "", page: 1 });
};

const handleCreateClick = (event: MouseEvent) => {
    toScreenRoute(
        { name: `${capitalize(moduleValue.value.key)}Create` },
        event
    );
};

const handleDeleteSelected = async () => {
    const idsToDelete = selectedEntityIds.value.filter(
        (value) => typeof value === "string" && value.trim() !== ""
    );
    if (idsToDelete.length === 0) {
        return;
    }

    try {
        await listQuery.deleteEntitiesAsync(idsToDelete);
        selectedEntityIds.value = [];
    } catch (error) {
       //todo: show notify
    }
};

const normalizePositiveInteger = (value: unknown, fallback: number): number => {
    if (typeof value === "number") {
        if (!Number.isFinite(value) || value < 1) {
            return fallback;
        }
        return Math.floor(value);
    }
    if (typeof value === "string") {
        const parsedValue = Number.parseInt(value, 10);
        if (Number.isNaN(parsedValue) || parsedValue < 1) {
            return fallback;
        }
        return parsedValue;
    }
    return fallback;
};

const handlePerPageChange = (nextValue: unknown) => {
    const nextPerPage = normalizePositiveInteger(
        nextValue,
        defaultTableState.perPage
    );

    const currentState = normalizeTableState(tableState.value);
    if (nextPerPage === currentState.perPage) {
        return;
    }

    patchUrlState({ perPage: nextPerPage, page: 1 });
};

const handlePageChange = (nextValue: number) => {
    const nextPage = nextValue < 1 ? defaultTableState.page : nextValue;

    const currentState = normalizeTableState(tableState.value);
    if (nextPage === currentState.page) {
        return;
    }

    patchUrlState({ page: nextPage });
};

const areSortByEqual = (
    firstValue: ISortBy[],
    secondValue: ISortBy[]
): boolean => {
    if (firstValue.length !== secondValue.length) {
        return false;
    }

    return firstValue.every((firstItem, index) => {
        const secondItem = secondValue[index];
        if (!secondItem) {
            return false;
        }
        return (
            firstItem.key === secondItem.key &&
            firstItem.order === secondItem.order
        );
    });
};

const handleOptionsUpdate = (options: IVuetifyTableOptions) => {
    const currentState = normalizeTableState(tableState.value);

    const nextPerPage =
        options.itemsPerPage < 1
            ? defaultTableState.perPage
            : options.itemsPerPage;
    const optionsPage =
        options.page < 1 ? defaultTableState.page : options.page;
    const nextPage = nextPerPage !== currentState.perPage ? 1 : optionsPage;

    const nextSortBy = normalizeSortBy(options.sortBy);

    const isSameState =
        currentState.page === nextPage &&
        currentState.perPage === nextPerPage &&
        areSortByEqual(currentState.sortBy, nextSortBy);

    if (isSameState) {
        return;
    }

    patchUrlState({
        page: nextPage,
        perPage: nextPerPage,
        sortBy: nextSortBy,
    });
};

const extractEntityIdFromRowClick = (payload: unknown): string | null => {
    if (!isPlainRecord(payload)) {
        return null;
    }

    const candidateEntities: unknown[] = [];
    candidateEntities.push(payload.item);
    candidateEntities.push(payload.internalItem);

    if (isPlainRecord(payload.item) && isPlainRecord(payload.item.raw)) {
        candidateEntities.push(payload.item.raw);
    }
    if (
        isPlainRecord(payload.internalItem) &&
        isPlainRecord(payload.internalItem.raw)
    ) {
        candidateEntities.push(payload.internalItem.raw);
    }

    for (const candidateEntity of candidateEntities) {
        if (isPlainRecord(candidateEntity)) {
            const idValue = candidateEntity.id;
            if (typeof idValue === "string" && idValue.trim() !== "") {
                return idValue;
            }
        }
    }

    return null;
};

const handleRowClick = async (event: MouseEvent, payload: unknown) => {
    const eventTarget = event.target;
    if (eventTarget instanceof HTMLElement) {
        const isSelectionClick =
            eventTarget.closest(".v-data-table__td--select") !== null ||
            eventTarget.closest(".v-selection-control") !== null;
        if (isSelectionClick) {
            return;
        }
    }

    const entityId = extractEntityIdFromRowClick(payload);
    if (!entityId) {
        return;
    }

    await toScreenRoute(
        {
            name: `${capitalize(moduleValue.value.key)}Detail`,
            params: { id: entityId },
        },
        event
    );
};
</script>

<style scoped lang="scss">
.module-list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;

    &__table {
        flex: 1 1 auto;
        min-height: 0;
    }

    &__per-page {
        flex: 0 0 92px;
        max-width: 92px;
    }

    &__footer {
        position: sticky;
        bottom: 0;
        z-index: 2;
        gap: 6px;
        background-color: rgb(var(--v-theme-surface));
        align-items: stretch;

        :deep(.module-list__footer-container) {
            display: flex;
            align-items: center;
            padding: 0 4px;
        }

        :deep(.module-list__footer-container > *) {
            align-self: center;
        }

        :deep(.v-slide-group__container) {
            align-items: center;
        }

        :deep(.v-slide-group__content) {
            align-items: center;
        }
    }

    &__footer-actions {
        width: 100%;
    }

    &__no-data {
        padding: 24px 16px;
    }

    &__no-data-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
    }
}
</style>
