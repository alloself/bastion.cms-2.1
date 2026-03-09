import { type AxiosError } from 'axios'
import type { QueryCache } from '@pinia/colada'
import type { Router } from 'vue-router'

import { currentUserQuery } from '@/ts/entities/user'
import { routeNames } from '@/ts/shared/const'

export const authErrorHandler = (router: Router, queryCache: QueryCache) => {
    return async (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const entry = queryCache.get(currentUserQuery.key)
            if (entry) {
                queryCache.setEntryState(entry, {
                    status: 'error',
                    error,
                    data: undefined,
                })
            }
            const currentPath = router.currentRoute.value.fullPath
            await router.push({ name: routeNames.Login, query: { redirect: currentPath } })
        }

        return Promise.reject(error)
    }
}
