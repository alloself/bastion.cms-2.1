import {
    defineQuery,
    useMutation,
    useQuery,
    useQueryCache,
} from "@pinia/colada";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { IBaseEntity, IServerDataList } from "@/admin/ts/shared/types";
import type { IModule } from "..";
import { isPlainRecord } from "@admin/ts/shared/typeGuards";
import {
    getModuleEntity,
    createModuleEntity,
    updateModuleEntity,
    deleteModuleEntity,
} from "../api";
import { getModuleBaseUrl } from "..";

export interface ICreateModuleDetailQueryParams {
    module: MaybeRefOrGetter<IModule>;
    entityId: MaybeRefOrGetter<string | undefined>;
}

interface IUpdateOptimisticContext<TDetail extends IBaseEntity | null> {
    previousData: TDetail | undefined;
    optimisticData: TDetail;
}

interface IDeleteOptimisticContext<T extends IBaseEntity> {
    previousData: T | undefined;
}

const getDetailQueryKey = (module: IModule, entityId: string = "create") => {
    return ["modules", module.key, "detail", entityId];
};

const getListQueryBaseKey = (module: IModule) => {
    return ["modules", module.key, "list"];
};

type TServerDataListMeta = Pick<
    IServerDataList<IBaseEntity>["meta"],
    "current_page" | "per_page" | "total" | "last_page"
>;

const isServerDataListMeta = (value: unknown): value is TServerDataListMeta => {
    if (!isPlainRecord(value)) {
        return false;
    }

    const currentPageValue = value.current_page;
    const perPageValue = value.per_page;
    const totalValue = value.total;
    const lastPageValue = value.last_page;

    if (typeof currentPageValue !== "number" || !Number.isFinite(currentPageValue)) {
        return false;
    }
    if (typeof perPageValue !== "number" || !Number.isFinite(perPageValue)) {
        return false;
    }
    if (typeof totalValue !== "number" || !Number.isFinite(totalValue)) {
        return false;
    }
    if (typeof lastPageValue !== "number" || !Number.isFinite(lastPageValue)) {
        return false;
    }

    return true;
};

const isServerDataList = <T extends IBaseEntity>(
    value: unknown
): value is IServerDataList<T> => {
    if (!isPlainRecord(value)) {
        return false;
    }

    return Array.isArray(value.data) && isServerDataListMeta(value.meta);
};

const normalizePositiveInteger = (value: number, fallback: number): number => {
    if (!Number.isFinite(value) || value < 1) {
        return fallback;
    }
    return Math.floor(value);
};

const calculateLastPage = (total: number, perPage: number): number => {
    const safeTotal = !Number.isFinite(total) || total < 0 ? 0 : total;
    const safePerPage = normalizePositiveInteger(perPage, 1);

    const lastPage = Math.ceil(safeTotal / safePerPage);
    return lastPage < 1 ? 1 : lastPage;
};

const extractSearchFromListQueryKey = (key: unknown): string | null => {
    if (!Array.isArray(key) || key.length < 4) {
        return null;
    }

    const paramsCandidate = key[key.length - 1];
    if (!isPlainRecord(paramsCandidate)) {
        return null;
    }

    const searchValue = paramsCandidate.search;
    if (typeof searchValue !== "string") {
        return null;
    }

    return searchValue;
};

const patchEntityInCachedLists = <T extends IBaseEntity>({
    queryCache,
    module,
    entityId,
    entity,
}: {
    queryCache: ReturnType<typeof useQueryCache>;
    module: IModule;
    entityId: string;
    entity: T;
}) => {
    const listEntries = queryCache.getEntries({
        key: getListQueryBaseKey(module),
    });

    listEntries.forEach((entry) => {
        const currentListData = entry.state.value.data;
        if (!isServerDataList<T>(currentListData)) {
            return;
        }

        const existingIndex = currentListData.data.findIndex(
            (listItem) => listItem.id === entityId
        );
        if (existingIndex < 0) {
            return;
        }

        const nextData = currentListData.data.map((listItem, index) => {
            if (index !== existingIndex) {
                return listItem;
            }
            return entity;
        });

        queryCache.setQueryData(entry.key, {
            ...currentListData,
            data: nextData,
        });
    });
};

const prependCreatedEntityToFirstPageCachedLists = <T extends IBaseEntity>({
    queryCache,
    module,
    entity,
}: {
    queryCache: ReturnType<typeof useQueryCache>;
    module: IModule;
    entity: T;
}) => {
    const listEntries = queryCache.getEntries({
        key: getListQueryBaseKey(module),
    });

    listEntries.forEach((entry) => {
        const currentListData = entry.state.value.data;
        if (!isServerDataList<T>(currentListData)) {
            return;
        }

        const searchValue = extractSearchFromListQueryKey(entry.key);
        if (typeof searchValue === "string" && searchValue.trim() !== "") {
            return;
        }

        const nextTotal = currentListData.meta.total + 1;
        const safePerPage = normalizePositiveInteger(currentListData.meta.per_page, 1);
        const nextLastPage = calculateLastPage(nextTotal, safePerPage);

        const isFirstPage = currentListData.meta.current_page === 1;
        if (!isFirstPage) {
            queryCache.setQueryData(entry.key, {
                ...currentListData,
                meta: {
                    ...currentListData.meta,
                    total: nextTotal,
                    last_page: nextLastPage,
                },
            });
            return;
        }

        const entityId = entity.id;
        let nextData: T[];

        if (typeof entityId === "string" && entityId.trim() !== "") {
            const existingIndex = currentListData.data.findIndex(
                (listItem) => listItem.id === entityId
            );
            if (existingIndex >= 0) {
                const dataWithoutExisting = currentListData.data.filter(
                    (_listItem, index) => index !== existingIndex
                );
                nextData = [entity, ...dataWithoutExisting];
            } else {
                nextData = [entity, ...currentListData.data];
            }
        } else {
            nextData = [entity, ...currentListData.data];
        }

        const limitedData = nextData.slice(0, safePerPage);

        queryCache.setQueryData(entry.key, {
            ...currentListData,
            data: limitedData,
            meta: {
                ...currentListData.meta,
                total: nextTotal,
                last_page: nextLastPage,
            },
        });
    });
};

export const createModuleDetailQuery = <T extends IBaseEntity>({
    module,
    entityId,
}: ICreateModuleDetailQueryParams) => {
    const queryCache = useQueryCache();

    const moduleValue = computed(() => toValue(module));
    const entityIdValue = computed(() => toValue(entityId));
    const baseUrl = computed(() => getModuleBaseUrl(moduleValue.value));
    const isNewEntity = computed(() => !entityIdValue.value);

    const detailQuery = useQuery({
        key: () => getDetailQueryKey(moduleValue.value, entityIdValue.value),
        query: async () => {
            const currentEntityId = entityIdValue.value;
            if (!currentEntityId) {
                return null;
            }
            return getModuleEntity<T>(baseUrl.value, currentEntityId);
        },
        enabled: () => !!entityIdValue.value,
    });

    const createMutation = useMutation({
        mutation: (payload: Partial<T>) =>
            createModuleEntity<T>(baseUrl.value, payload),

        onSuccess(createdEntity) {
            prependCreatedEntityToFirstPageCachedLists<T>({
                queryCache,
                module: moduleValue.value,
                entity: createdEntity,
            });

            const createdId = createdEntity.id;
            if (typeof createdId === "string" && createdId.trim() !== "") {
                queryCache.setQueryData(
                    getDetailQueryKey(moduleValue.value, createdId),
                    createdEntity
                );
            }
        },
    });

    const updateMutation = useMutation({
        mutation: ({
            entityId: updateEntityId,
            payload,
        }: {
            entityId: string;
            payload: Partial<T>;
        }) => updateModuleEntity<T>(baseUrl.value, updateEntityId, payload),

        onMutate({
            entityId: updateEntityId,
            payload,
        }): IUpdateOptimisticContext<T | null> {
            const currentKey = getDetailQueryKey(
                moduleValue.value,
                updateEntityId
            );
            const previousData = queryCache.getQueryData<T | null>(currentKey);

            const optimisticData =
                previousData !== null && previousData !== undefined
                    ? { ...previousData, ...payload, id: updateEntityId }
                    : null;

            queryCache.setQueryData(currentKey, optimisticData);
            queryCache.cancelQueries({ key: currentKey });

            return { previousData, optimisticData };
        },

        onError(_error, { entityId: updateEntityId }, context) {
            if (context?.previousData) {
                const currentKey = getDetailQueryKey(
                    moduleValue.value,
                    updateEntityId
                );
                queryCache.setQueryData(currentKey, context.previousData);
            }
        },

        onSuccess(responseData, { entityId: updateEntityId }) {
            const currentKey = getDetailQueryKey(
                moduleValue.value,
                updateEntityId
            );
            queryCache.setQueryData(currentKey, responseData);

            patchEntityInCachedLists<T>({
                queryCache,
                module: moduleValue.value,
                entityId: updateEntityId,
                entity: responseData,
            });
        },
    });

    const deleteMutation = useMutation({
        mutation: (deleteEntityId: string) =>
            deleteModuleEntity(baseUrl.value, deleteEntityId),

        onMutate(deleteEntityId): IDeleteOptimisticContext<T> {
            const currentKey = getDetailQueryKey(
                moduleValue.value,
                deleteEntityId
            );
            const previousData = queryCache.getQueryData<T>(currentKey);

            queryCache.setQueryData(currentKey, null);
            queryCache.cancelQueries({ key: currentKey });

            return { previousData };
        },

        onError(_error, deleteEntityId, context) {
            if (context?.previousData) {
                const currentKey = getDetailQueryKey(
                    moduleValue.value,
                    deleteEntityId
                );
                queryCache.setQueryData(currentKey, context.previousData);
            }
        },

        onSettled() {
            queryCache.invalidateQueries({
                key: getListQueryBaseKey(moduleValue.value),
            });
        },
    });

    const invalidateDetail = () => {
        const currentEntityId = entityIdValue.value;
        if (!currentEntityId) {
            return Promise.resolve();
        }
        return queryCache.invalidateQueries({
            key: getDetailQueryKey(moduleValue.value, currentEntityId),
        });
    };

    const setEntityData = (data: T | null) => {
        const currentEntityId = entityIdValue.value;
        if (!currentEntityId) {
            return;
        }
        queryCache.setQueryData(
            getDetailQueryKey(moduleValue.value, currentEntityId),
            data
        );
    };

    return {
        data: detailQuery.data,
        status: detailQuery.status,
        asyncStatus: detailQuery.asyncStatus,
        error: detailQuery.error,
        isLoading: detailQuery.isLoading,
        isPending: detailQuery.isPending,
        refresh: detailQuery.refresh,
        refetch: detailQuery.refetch,
        isNewEntity,
        create: createMutation.mutate,
        createAsync: createMutation.mutateAsync,
        isCreating: createMutation.isLoading,
        createError: createMutation.error,
        update: updateMutation.mutate,
        updateAsync: updateMutation.mutateAsync,
        isUpdating: updateMutation.isLoading,
        updateError: updateMutation.error,
        deleteEntity: deleteMutation.mutate,
        deleteEntityAsync: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isLoading,
        deleteError: deleteMutation.error,
        invalidateDetail,
        setEntityData,
    };
};

export const defineModuleDetailQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule>,
    entityId: MaybeRefOrGetter<string | undefined>
) => {
    return defineQuery(() => {
        const moduleValue = computed(() => toValue(module));
        const entityIdValue = computed(() => toValue(entityId));
        const baseUrl = computed(() => getModuleBaseUrl(moduleValue.value));

        return {
            key: () =>
                getDetailQueryKey(moduleValue.value, entityIdValue.value),
            query: async () => {
                const currentEntityId = entityIdValue.value;
                if (!currentEntityId) {
                    return null;
                }
                return getModuleEntity<T>(baseUrl.value, currentEntityId);
            },
            enabled: () => !!entityIdValue.value,
        };
    });
};
