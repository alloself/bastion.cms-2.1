import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { isObject } from 'lodash'
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
    })

    const createMutation = useMutation({
        mutation: (payload: Partial<T>) => createModuleDetailQuery<T>(moduleValue, payload),
        onSettled() {
            queryCache.invalidateQueries({
                key: ['list', moduleValue.key],
            })
        },
    })

    const updateMutation = useMutation({
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
        onMutate({ id, payload }) {
            const oldDetail = queryCache.getQueryData<T>(['detail', moduleValue.key, id])
            const newDetail = {
                ...oldDetail,
                ...payload,
            }
            queryCache.setQueryData(['detail', moduleValue.key, id], newDetail)
            queryCache.cancelQueries({ key: ['detail', moduleValue.key, id] })
            return { oldDetail, newDetail }
        },
        onError(_err, { id }, { newDetail, oldDetail }) {
            if (newDetail === queryCache.getQueryData(['detail', moduleValue.key, id])) {
                queryCache.setQueryData(['detail', moduleValue.key, id], oldDetail)
            }
        },
        onSuccess(data, { id }) {
            queryCache.setQueryData(['detail', moduleValue.key, id], data)

            const listEntries = queryCache.getEntries({
                key: ['list', moduleValue.key],
            })

            let foundInList = false

            listEntries.forEach((entry) => {
                const listData = entry.state.value.data
                if (
                    listData &&
                    isObject(listData) &&
                    'data' in listData &&
                    Array.isArray(listData.data)
                ) {
                    const itemIndex = listData.data.findIndex((item: IBaseEntity) => item.id === id)
                    if (itemIndex !== -1) {
                        foundInList = true
                        const updatedData = [...listData.data]
                        updatedData[itemIndex] = {
                            ...updatedData[itemIndex],
                            ...data,
                        }
                        queryCache.setQueryData(entry.key, {
                            ...listData,
                            data: updatedData,
                        })
                    }
                }
            })

            if (!foundInList) {
                queryCache.invalidateQueries({
                    key: ['list', moduleValue.key],
                })
            }

            moduleValue.onEntityUpdate?.(data, queryCache)
        },
    })

    const deleteMutation = useMutation({
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
        onMutate(id) {
            const oldDetail = queryCache.getQueryData<T>(['detail', moduleValue.key, id])
            queryCache.setQueryData(['detail', moduleValue.key, id], null)
            queryCache.cancelQueries({ key: ['detail', moduleValue.key, id] })
            return { oldDetail }
        },
        onError(_err, id, { oldDetail }) {
            if (oldDetail) {
                queryCache.setQueryData(['detail', moduleValue.key, id], oldDetail)
            }
        },
        onSettled(_data, _error, id) {
            const [detailEntry] = queryCache.getEntries({
                key: ['detail', moduleValue.key, id],
                exact: true,
            })
            if (detailEntry) {
                queryCache.remove(detailEntry)
            }
            queryCache.invalidateQueries({
                key: ['list', moduleValue.key],
            })
        },
    })

    return { detailQuery, createMutation, updateMutation, deleteMutation }
}
