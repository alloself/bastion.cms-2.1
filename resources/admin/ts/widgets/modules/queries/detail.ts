import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type {
    IBaseEntity,
    IModule,
    TUUID,
} from '@/ts/shared/types'

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

    const detailQuery = useQuery<T | null>({
        key: () => ['detail', moduleValue.key, getIdValue() ?? 'create'],
        query: async () => {
            const idValue = getIdValue()
            if (!idValue) {
                return null
            }
            return getModuleDetailQuery(moduleValue, idValue)
        },
        enabled: () => !!getIdValue(),
        gcTime: 0,
    })

    const createMutation = useMutation({
        mutation: (payload: Partial<T>) => createModuleDetailQuery<T>(moduleValue, payload),
        onSettled: (_data, error) => {
            if (error) {
                return
            }

            queryCache.invalidateQueries({ key: ['list', moduleValue.key] })
            queryCache.invalidateQueries({ key: ['tree-children', moduleValue.key] })
        },
    })

    const updateMutation = useMutation({
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
        onSettled: (_data, error) => {
            if (error) {
                return
            }

            queryCache.invalidateQueries({ key: ['list', moduleValue.key] })
            queryCache.invalidateQueries({ key: ['tree-children', moduleValue.key] })
            queryCache.invalidateQueries({ key: ['detail', moduleValue.key] })
        },
    })

    const deleteMutation = useMutation({
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
        onSettled: (_data, error, id) => {
            if (error) {
                return
            }

            queryCache.invalidateQueries({ key: ['list', moduleValue.key] })
            queryCache.invalidateQueries({
                key: ['detail', moduleValue.key, id],
                exact: true,
            })
            queryCache.invalidateQueries({ key: ['tree-children', moduleValue.key] })
        },
    })

    return { detailQuery, createMutation, updateMutation, deleteMutation }
}
