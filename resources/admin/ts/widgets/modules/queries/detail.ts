import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type { IBaseEntity, IModule, TUUID } from '@/ts/shared/types'

import {
    createModuleDetailQuery,
    deleteModuleDetailQuery,
    getModuleDetailQuery,
    updateModuleDetailQuery,
} from '../api'

export const useModuleDetailQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    id: MaybeRefOrGetter<TUUID | undefined>,
) => {
    const moduleValue = toValue(module)
    const getIdValue = () => toValue(id)
    const queryCache = useQueryCache()

    const detailQuery = useQuery<T | undefined>({
        key: () => ['detail', moduleValue.key, getIdValue() ?? 'create'],
        query: async () => {
            const idValue = getIdValue()
            if (!idValue) {
                return undefined
            }
            return getModuleDetailQuery(moduleValue, idValue)
        },
        enabled: () => !!getIdValue(),
        gcTime: 0,
    })

    const createMutation = useMutation({
        key: () => ['create', moduleValue.key, getIdValue() ?? 'create'],
        mutation: (payload: Partial<T>) => createModuleDetailQuery<T>(moduleValue, payload),
    })

    const updateMutation = useMutation({
        key: () => ['update', moduleValue.key, getIdValue() ?? 'update'],
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
        onSettled: (updatedEntity, error) => {
            if (error || !updatedEntity || !updatedEntity.id) {
                queryCache.invalidateQueries({
                    predicate: (entry) => entry.key.includes(moduleValue.key),
                })
                return
            }

            queryCache.setQueriesData<T | undefined>(
                {
                    predicate: (entry) => entry.key.includes(moduleValue.key),
                },
                (cacheData) => {
                    console.log(cacheData)
                    return cacheData
                },
            )
        },
    })

    const deleteMutation = useMutation({
        key: () => ['delete', moduleValue.key, getIdValue() ?? 'delete'],
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
    })

    return { detailQuery, createMutation, updateMutation, deleteMutation }
}
