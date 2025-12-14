import {
    defineQuery,
    useMutation,
    useQuery,
    useQueryCache,
} from "@pinia/colada";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { IBaseEntity } from "@admin/ts/types";
import type { IModule } from "..";
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

        onSettled() {
            queryCache.invalidateQueries({
                key: getListQueryBaseKey(moduleValue.value),
            });
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
        },

        onSettled() {
            queryCache.invalidateQueries({
                key: getListQueryBaseKey(moduleValue.value),
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
