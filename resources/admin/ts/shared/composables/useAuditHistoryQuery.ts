import { useInfiniteQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, computed, toValue } from 'vue'

import { getAuditsQuery } from '@/ts/widgets/modules/api'
import type { IServerDataList, TAuditModelWithResolved } from '@/ts/shared/types'

const DEFAULT_PER_PAGE = 10

export const useAuditHistoryQuery = (
    modelKey: MaybeRefOrGetter<string>,
    entityId: MaybeRefOrGetter<string | undefined>,
    search: MaybeRefOrGetter<string>,
    enabled: MaybeRefOrGetter<boolean>,
) => {
    const { state, asyncStatus, hasNextPage, loadNextPage, refetch } = useInfiniteQuery({
        key: () => {
            const modelValue = toValue(modelKey)
            const idValue = toValue(entityId)
            const searchValue = toValue(search)

            return ['audit-history', modelValue, idValue ?? '', searchValue ?? '']
        },
        query: async ({ pageParam }) => {
            const modelValue = toValue(modelKey)
            const idValue = toValue(entityId)
            const searchValue = toValue(search)

            if (!modelValue || !idValue) {
                const emptyResult: IServerDataList<TAuditModelWithResolved> = {
                    data: [],
                    links: {
                        first: null,
                        last: null,
                        prev: null,
                        next: null,
                    },
                    meta: {
                        current_page: 1,
                        from: null,
                        last_page: 1,
                        links: [],
                        path: '',
                        per_page: DEFAULT_PER_PAGE,
                        to: null,
                        total: 0,
                    },
                }
                return emptyResult
            }

            return getAuditsQuery(modelValue, idValue, {
                page: pageParam,
                perPage: DEFAULT_PER_PAGE,
                ...(searchValue && searchValue.trim() !== '' && { search: searchValue.trim() }),
            })
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage.meta) {
                return null
            }

            const hasNext = lastPage.meta.current_page < lastPage.meta.last_page
            return hasNext ? lastPage.meta.current_page + 1 : null
        },
        enabled: () => toValue(enabled) && !!toValue(modelKey) && !!toValue(entityId),
    })

    const pages = computed(() => state.value?.data?.pages ?? [])

    const items = computed(() => {
        return pages.value.flatMap((page) => page.data)
    })

    const isLoadingMore = computed(() => asyncStatus.value === 'loading' && pages.value.length > 0)

    const isInitialLoading = computed(() => asyncStatus.value === 'loading' && pages.value.length === 0)

    return {
        items,
        hasMore: hasNextPage,
        isLoadingMore,
        isInitialLoading,
        loadMore: loadNextPage,
        refetch,
    }
}
