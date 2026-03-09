import type { QueryCache } from '@pinia/colada'
import type { RouteLocationNormalized, Router } from 'vue-router'

import { currentUserQuery } from '@/ts/entities/user'
import { routeNames } from '@/ts/shared/const'

const getCurrentUser = (queryCache: QueryCache) => {
    return queryCache.getQueryData(currentUserQuery.key)
}

export const ensureCurrentUserLoaded = async (queryCache: QueryCache) => {
    const entry = queryCache.ensure(currentUserQuery)

    await queryCache.refresh(entry)
}

export const resolveProtectedRouteGuard = (to: RouteLocationNormalized, queryCache: QueryCache) => {
    if (to.meta.requiresAuth && !getCurrentUser(queryCache)) {
        return { name: routeNames.Login, query: { redirect: to.fullPath } }
    }

    return true
}

export const resolveLoginRouteGuard = (to: RouteLocationNormalized, queryCache: QueryCache) => {
    if (to.name === routeNames.Login && getCurrentUser(queryCache)) {
        return { name: routeNames.Authenticated }
    }

    return true
}

export const setupGuards = (queryCache: QueryCache, router: Router) => {
    const guards = [
        {
            handler: async () => {
                await ensureCurrentUserLoaded(queryCache)

                return true
            },
        },
        {
            handler: async (to: RouteLocationNormalized) => {
                return resolveLoginRouteGuard(to, queryCache)
            },
        },
        {
            handler: async (to: RouteLocationNormalized) => {
                return resolveProtectedRouteGuard(to, queryCache)
            },
        },
    ]
    guards.forEach(({ handler }) => router.beforeEach(handler))
}
