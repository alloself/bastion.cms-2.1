import { useInfiniteQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import { client } from '@/ts/shared/api/client'
import type { IBaseEntity, IServerDataList } from '@/ts/shared/types'
import { DEFAULT_PAGINATION_PARAMS } from '@/ts/widgets/modules/const'

const DEFAULT_PER_PAGE = 10

export const useInfiniteRelationSearch = <T extends IBaseEntity>(
    moduleKey: MaybeRefOrGetter<string>,
    search: MaybeRefOrGetter<string>,
    relations: MaybeRefOrGetter<string[]>,
    initialItems: MaybeRefOrGetter<T[]>,
    selectedIds: MaybeRefOrGetter<Array<T['id']>>,
) => {
    const { state, asyncStatus, hasNextPage, loadNextPage, refetch } = useInfiniteQuery({
        key: () => {
            const queryParams = {
                ...DEFAULT_PAGINATION_PARAMS,
                search: toValue(search),
            }

            return ['infinity', toValue(moduleKey), JSON.stringify(queryParams)]
        },
        query: async ({ pageParam }) => {
            const endpointValue = toValue(moduleKey)
            const relationsValue = toValue(relations)
            const searchValue = toValue(search)
            const selectedIdsValue = toValue(selectedIds)

            const { data } = await client.get<IServerDataList<T>>(`/api/admin/${endpointValue}`, {
                params: {
                    page: pageParam,
                    per_page: DEFAULT_PER_PAGE,
                    ...(searchValue && { search: searchValue }),
                    ...(relationsValue.length && { relations: relationsValue.join(',') }),
                    ...(selectedIdsValue.length && { includes: selectedIdsValue }),
                },
            })

            return data
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const hasNext = lastPage.meta.current_page < lastPage.meta.last_page
            return hasNext ? lastPage.meta.current_page + 1 : null
        },
        initialData: () => {
            const initial = toValue(initialItems)
            const selectedIdsValue = toValue(selectedIds)

            if (selectedIdsValue.length && !initial.length) {
                return undefined
            }

            return {
                pages: [{ data: initial }],
                pageParams: [1],
            }
        },
    })

    const pages = computed(() => state.value?.data?.pages ?? [])

    const items = computed(() => {
        const pagesData = pages.value.flatMap((page) => page.data)
        const initial = toValue(initialItems)

        const itemsMap = new Map<string, T>()

        for (const item of initial) {
            itemsMap.set(String(item.id), item)
        }
        
        for (const item of pagesData) {
            itemsMap.set(String(item.id), item)
        }

        return Array.from(itemsMap.values())
    })

    const isLoadingMore = computed(() => asyncStatus.value === 'loading' && pages.value.length)

    const isInitialLoading = computed(() => asyncStatus.value === 'loading' && !pages.value.length)

    return {
        items,
        hasMore: hasNextPage,
        isLoadingMore,
        isInitialLoading,
        loadMore: loadNextPage,
        refetch,
    }
}
