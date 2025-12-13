import {
    defineQuery,
    useMutation,
    useQuery,
    useQueryCache,
} from "@pinia/colada";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { IBaseEntity, IServerDataList } from "@admin/ts/types";
import type { IModule } from "..";
import {
    getModuleList,
    deleteModuleEntity,
    deleteModuleEntities,
    type IModuleListQueryParams,
} from "../api";
import { getModuleBaseUrl } from "..";

export interface IUseModuleListQueryParams {
    module: MaybeRefOrGetter<IModule>;
    queryParams: MaybeRefOrGetter<IModuleListQueryParams>;
}

interface IDeleteOptimisticContext<T extends IBaseEntity> {
    previousData: IServerDataList<T> | undefined;
}

interface IDeleteBatchOptimisticContext<T extends IBaseEntity> {
    previousData: IServerDataList<T> | undefined;
    deletedIds: string[];
}

const getListQueryKey = (module: IModule, params: IModuleListQueryParams) => {
    return [
        "modules",
        module.key,
        "list",
        params,
    ];
};

const getListQueryBaseKey = (module: IModule) => {
    return ["modules", module.key, "list"];
};

export const useModuleListQuery = <T extends IBaseEntity>({
    module,
    queryParams,
}: IUseModuleListQueryParams) => {
    const queryCache = useQueryCache();

    const moduleValue = computed(() => toValue(module));
    const paramsValue = computed(() => toValue(queryParams));
    const baseUrl = computed(() => getModuleBaseUrl(moduleValue.value));

    const listQuery = useQuery({
        key: () => getListQueryKey(moduleValue.value, paramsValue.value),
        query: () => getModuleList<T>(baseUrl.value, paramsValue.value),
    });

    const deleteMutation = useMutation({
        mutation: (entityId: string) =>
            deleteModuleEntity(baseUrl.value, entityId),

        onMutate(entityId): IDeleteOptimisticContext<T> {
            const currentKey = getListQueryKey(
                moduleValue.value,
                paramsValue.value
            );
            const previousData =
                queryCache.getQueryData<IServerDataList<T>>(currentKey);

            if (previousData) {
                const optimisticData: IServerDataList<T> = {
                    ...previousData,
                    data: previousData.data.filter(
                        (item) => item.id !== entityId
                    ),
                    meta: {
                        ...previousData.meta,
                        total: previousData.meta.total - 1,
                    },
                };
                queryCache.setQueryData(currentKey, optimisticData);
            }

            queryCache.cancelQueries({ key: currentKey });

            return { previousData };
        },

        onError(_error, _entityId, context) {
            if (context?.previousData) {
                const currentKey = getListQueryKey(
                    moduleValue.value,
                    paramsValue.value
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

    const deleteBatchMutation = useMutation({
        mutation: (entityIds: string[]) =>
            deleteModuleEntities(baseUrl.value, entityIds),

        onMutate(entityIds): IDeleteBatchOptimisticContext<T> {
            const currentKey = getListQueryKey(
                moduleValue.value,
                paramsValue.value
            );
            const previousData =
                queryCache.getQueryData<IServerDataList<T>>(currentKey);

            if (previousData) {
                const idsSet = new Set(entityIds);
                const optimisticData: IServerDataList<T> = {
                    ...previousData,
                    data: previousData.data.filter(
                        (item) => !idsSet.has(item.id ?? "")
                    ),
                    meta: {
                        ...previousData.meta,
                        total: previousData.meta.total - entityIds.length,
                    },
                };
                queryCache.setQueryData(currentKey, optimisticData);
            }

            queryCache.cancelQueries({ key: currentKey });

            return { previousData, deletedIds: entityIds };
        },

        onError(_error, _entityIds, context) {
            if (context?.previousData) {
                const currentKey = getListQueryKey(
                    moduleValue.value,
                    paramsValue.value
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

    const invalidateList = () => {
        return queryCache.invalidateQueries({
            key: getListQueryBaseKey(moduleValue.value),
        });
    };

    return {
        ...listQuery,
        deleteEntity: deleteMutation.mutate,
        deleteEntityAsync: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isLoading,
        deleteError: deleteMutation.error,
        deleteEntities: deleteBatchMutation.mutate,
        deleteEntitiesAsync: deleteBatchMutation.mutateAsync,
        isDeletingBatch: deleteBatchMutation.isLoading,
        deleteBatchError: deleteBatchMutation.error,
        invalidateList,
    };
};

export const defineModuleListQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule>
) => {
    return defineQuery(() => {
        const moduleValue = computed(() => toValue(module));
        const baseUrl = computed(() => getModuleBaseUrl(moduleValue.value));

        return {
            key: () => getListQueryBaseKey(moduleValue.value),
            query: () =>
                getModuleList<T>(baseUrl.value, {
                    page: 1,
                    per_page: 10,
                }),
        };
    });
};
