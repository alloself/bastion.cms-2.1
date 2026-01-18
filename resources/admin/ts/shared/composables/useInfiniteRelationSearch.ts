import { useInfiniteQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import { client } from '@/ts/shared/api/client'
import type { IBaseEntity, IServerDataList } from '@/ts/shared/types'

const DEFAULT_PER_PAGE = 10

export const useInfiniteRelationSearch = <T extends IBaseEntity>(
    endpoint: MaybeRefOrGetter<string>,
    search: MaybeRefOrGetter<string>,
    relations: MaybeRefOrGetter<string[]>,
) => {
    const { state, asyncStatus, hasNextPage, loadNextPage, refetch } = useInfiniteQuery({
        key: () => ['relation-search', toValue(endpoint), toValue(search)],
        query: async ({ pageParam }) => {
            const endpointValue = toValue(endpoint)
            const relationsValue = toValue(relations)
            const searchValue = toValue(search)

            const { data } = await client.get<IServerDataList<T>>(`/api/admin/${endpointValue}`, {
                params: {
                    page: pageParam,
                    per_page: DEFAULT_PER_PAGE,
                    ...(searchValue && { search: searchValue }),
                    ...(relationsValue.length && { relations: relationsValue.join(',') }),
                },
            })

            return data
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const hasNext = lastPage.meta.current_page < lastPage.meta.last_page
            return hasNext ? lastPage.meta.current_page + 1 : null
        },
    })

    const pages = computed(() => state.value?.data?.pages ?? [])

    const items = computed(() => pages.value.flatMap((page) => page.data))

    const isLoadingMore = computed(() => asyncStatus.value === 'loading' && pages.value.length)

    const isInitialLoading = computed(
        () => asyncStatus.value === 'loading' && !pages.value.length,
    )

    return {
        items,
        hasMore: hasNextPage,
        isLoadingMore,
        isInitialLoading,
        loadMore: loadNextPage,
        refetch,
    }
}
