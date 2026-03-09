import type { QueryCache } from '@pinia/colada'
import type { RouteLocationNormalized, Router } from 'vue-router'

import { currentUserQuery } from '@/ts/entities/user'
import { routeNames } from '@/ts/shared/const'

const getCurrentUser = (queryCache: QueryCache) => {
    return queryCache.getQueryData(currentUserQuery.key)
}

export const setupGuards = (queryCache: QueryCache, router: Router) => {
    const guards = [
        {
            handler: async () => {
                const existingEntry = queryCache.get(currentUserQuery.key)

                if (existingEntry?.state?.value?.status === 'error') {
                    return true
                }

                try {
                    await queryCache.refresh(queryCache.ensure(currentUserQuery))
                } catch {
                    return true
                }

                return true
            },
        },
        {
            handler: async (to: RouteLocationNormalized) => {
                if (to.name === routeNames.Login && getCurrentUser(queryCache)) {
                    return { name: routeNames.Authenticated }
                }

                return true
            },
        },
    ]
    guards.forEach(({ handler }) => router.beforeEach(handler))
}
