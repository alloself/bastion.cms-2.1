import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type { IBaseEntity, IModule, IServerDataList, ISortBy, TUUID } from '@/ts/shared/types'

import {
    type IModuleListQueryParams,
    createModuleDetailQuery,
    deleteModuleDetailQuery,
    getModuleDetailQuery,
    updateModuleDetailQuery,
} from '../api'

const compareValues = (valueA: unknown, valueB: unknown, order: 'asc' | 'desc'): number => {
    if (valueA == null && valueB == null) {
        return 0
    }
    if (valueA == null) {
        return 1
    }
    if (valueB == null) {
        return -1
    }

    let result = 0
    if (typeof valueA === 'string' && typeof valueB === 'string') {
        result = valueA.localeCompare(valueB)
    } else {
        result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
    }

    return order === 'desc' ? -result : result
}

const findInsertIndex = <T extends IBaseEntity>(list: T[], newItem: T, sortBy: ISortBy[] = []) => {
    for (let index = 0; index < list.length; index++) {
        const item = list[index]

        if (!item) {
            return list.length
        }

        let shouldInsertHere = false
        let shouldContinue = false

        for (const sort of sortBy) {
            const valueA = newItem[sort.key as keyof T]
            const valueB = item[sort.key as keyof T]
            const cmp = compareValues(valueA, valueB, sort.order)

            if (cmp < 0) {
                shouldInsertHere = true
                break
            }
            if (cmp > 0) {
                shouldContinue = true
                break
            }
        }

        if (shouldInsertHere) {
            return index
        }
        if (shouldContinue) {
            continue
        }
    }
    return list.length
}

export const useModuleDetailQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    id: MaybeRefOrGetter<TUUID | undefined>,
) => {
    const moduleValue = toValue(module)
    const getIdValue = () => toValue(id)

    const queryCache = useQueryCache()

    const updateListCache = (
        id: TUUID,
        updateFn: (listData: IBaseEntity[]) => IBaseEntity[],
    ): boolean => {
        const listEntries = queryCache.getEntries({
            key: ['list', moduleValue.key],
        })

        let foundInList = false

        listEntries.forEach((entry) => {
            const listData = entry.state.value.data as IServerDataList<T>
            const itemIndex = listData.data.findIndex((item) => item.id === id)
            if (itemIndex !== -1) {
                foundInList = true
                const updatedData = updateFn(listData.data)
                queryCache.setQueryData(entry.key, {
                    ...listData,
                    data: updatedData,
                })
            }
        })

        if (!foundInList) {
            queryCache.invalidateQueries({
                key: ['list', moduleValue.key],
            })
        }

        return foundInList
    }

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
        onSettled: (newItem, error) => {
            if (error || !newItem) {
                return
            }

            const entries = queryCache.getEntries({
                key: ['list', moduleValue.key],
            })

            entries.forEach((entry) => {
                const queryKey = entry.key[2]?.toString()

                if (!queryKey) {
                    return
                }

                const queryParams = JSON.parse(queryKey) as IModuleListQueryParams
                const listData = entry.state.value.data as IServerDataList<T> // https://github.com/posva/pinia-colada/issues/431

                if (queryParams.search) {
                    queryCache.invalidateQueries({ key: entry.key, exact: true })
                    return
                }

                const insertIndex = findInsertIndex(listData.data, newItem, queryParams.sortBy)

                if (insertIndex >= queryParams.perPage) {
                    queryCache.invalidateQueries({ key: entry.key, exact: true })
                    return
                }

                const updatedData = [...listData.data]
                updatedData.splice(insertIndex, 0, newItem)

                queryCache.setQueryData(entry.key, {
                    ...listData,
                    data: updatedData.slice(0, queryParams.perPage),
                    meta: {
                        ...listData.meta,
                        total: listData.meta.total + 1,
                    },
                })
            })
        },
    })

    const updateMutation = useMutation({
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
        onMutate: ({ id, payload }) => {
            const oldDetail = queryCache.getQueryData<T>(['detail', moduleValue.key, id])
            const newDetail = {
                ...oldDetail,
                ...payload,
            }
            queryCache.setQueryData(['detail', moduleValue.key, id], newDetail)
            queryCache.cancelQueries({ key: ['detail', moduleValue.key, id] })
            return { oldDetail, newDetail }
        },
        onError: (_err, { id }, { newDetail, oldDetail }) => {
            if (newDetail === queryCache.getQueryData(['detail', moduleValue.key, id])) {
                queryCache.setQueryData(['detail', moduleValue.key, id], oldDetail)
            }
        },
        onSuccess: (data, { id }) => {
            queryCache.setQueryData(['detail', moduleValue.key, id], data)

            updateListCache(id, (listData) => {
                const itemIndex = listData.findIndex((item: IBaseEntity) => item.id === id)
                const updatedData = [...listData]
                updatedData[itemIndex] = {
                    ...updatedData[itemIndex],
                    ...data,
                }
                return updatedData
            })

            moduleValue.onEntityUpdate?.(data, queryCache)
        },
    })

    const deleteMutation = useMutation({
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
        onMutate: (id) => {
            const oldDetail = queryCache.getQueryData<T>(['detail', moduleValue.key, id])
            queryCache.setQueryData(['detail', moduleValue.key, id], null)
            queryCache.cancelQueries({ key: ['detail', moduleValue.key, id] })
            return { oldDetail }
        },
        onError: (_err, id, { oldDetail }) => {
            if (oldDetail) {
                queryCache.setQueryData(['detail', moduleValue.key, id], oldDetail)
            }
        },
        onSettled: (_data, _error, id) => {
            const [detailEntry] = queryCache.getEntries({
                key: ['detail', moduleValue.key, id],
                exact: true,
            })
            if (detailEntry) {
                queryCache.remove(detailEntry)
            }

            updateListCache(id, (listData) => {
                return listData.filter((item: IBaseEntity) => item.id !== id)
            })
        },
    })

    return { detailQuery, createMutation, updateMutation, deleteMutation }
}
