import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { isObject } from 'lodash'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type {
    IBaseEntity,
    IBaseTreeEntity,
    IInfiniteQueryData,
    IModule,
    IServerDataList,
    TUUID,
} from '@/ts/shared/types'

import {
    createModuleDetailQuery,
    deleteModuleDetailQuery,
    getModuleDetailQuery,
    isInfiniteQueryData,
    isServerListData,
    updateModuleDetailQuery,
} from '../api'

type TModuleCacheData<T> = T | T[] | IServerDataList<T> | IInfiniteQueryData<T> | undefined

const hasChildren = <T extends IBaseEntity>(entity: unknown): entity is IBaseTreeEntity<T> =>
    isObject(entity) &&
    'children' in entity &&
    Array.isArray(entity.children) &&
    entity.children.length > 0

const traverseChildren = <T extends IBaseEntity>(children: T[] = [], updatedEntity: T): T[] =>
    children.map((item) => {
        if (item.id === updatedEntity.id) {
            return updatedEntity
        }
        if (hasChildren<T>(item) && item.children) {
            return {
                ...item,
                children: traverseChildren(item.children, updatedEntity),
            }
        }
        return item
    })

export const useModuleDetailQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    id: MaybeRefOrGetter<TUUID | undefined>,
) => {
    const moduleValue = toValue(module)
    const getIdValue = () => toValue(id)
    const queryCache = useQueryCache()
    const invalidateModuleQueries = () => {
        queryCache.invalidateQueries({
            predicate: (entry) => entry.key.includes(moduleValue.key),
        })
    }

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
        onSettled: () => {
            invalidateModuleQueries()
        },
    })

    const updateMutation = useMutation({
        key: () => ['update', moduleValue.key, getIdValue() ?? 'update'],
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
        onSettled: (updatedEntity, error) => {
            if (error || !updatedEntity || !updatedEntity.id) {
                invalidateModuleQueries()
                return
            }

            queryCache.setQueriesData<TModuleCacheData<T>>(
                {
                    predicate: (entry) => entry.key.includes(moduleValue.key),
                },
                (cacheData) => {
                    if (Array.isArray(cacheData) && cacheData.length) {
                        const updatedData = cacheData.map((item) => {
                            if (item.id === updatedEntity.id) {
                                return updatedEntity
                            }
                            if (hasChildren<T>(item) && item.children) {
                                return {
                                    ...item,
                                    children: traverseChildren(item.children, updatedEntity),
                                }
                            }
                            return item
                        })
                        console.log(updatedData, cacheData)
                        return updatedData
                    }

                    if (isServerListData<T>(cacheData)) {
                        return {
                            ...cacheData,
                            data: cacheData.data.map((item) =>
                                item.id === updatedEntity.id ? updatedEntity : item,
                            ),
                        }
                    }

                    if (isInfiniteQueryData<T>(cacheData)) {
                        return {
                            ...cacheData,
                            pages: cacheData.pages.map((page) => ({
                                ...page,
                                data: page.data.map((item: T) =>
                                    item.id === updatedEntity.id ? updatedEntity : item,
                                ),
                            })),
                        }
                    }

                    if (
                        isObject(cacheData) &&
                        !Array.isArray(cacheData) &&
                        cacheData.id === updatedEntity.id
                    ) {
                        if (hasChildren<T>(cacheData)) {
                            return {
                                ...cacheData,
                                children: traverseChildren(cacheData.children, updatedEntity),
                            }
                        }

                        return updatedEntity
                    }

                    return cacheData
                },
            )

            moduleValue.onEntityUpdate?.(updatedEntity, queryCache)
        },
    })

    const deleteMutation = useMutation({
        key: () => ['delete', moduleValue.key, getIdValue() ?? 'delete'],
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
        onSettled: () => {
            invalidateModuleQueries()
        },
    })

    return { detailQuery, createMutation, updateMutation, deleteMutation }
}
