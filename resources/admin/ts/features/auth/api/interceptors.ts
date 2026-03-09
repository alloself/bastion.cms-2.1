import { type AxiosError } from 'axios'
import type { QueryCache } from '@pinia/colada'
import type { Router } from 'vue-router'
import { routeNames } from '@/ts/shared/const'

export const authErrorHandler = (router: Router, queryCache: QueryCache) => {
    return async (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            queryCache.invalidateQueries({ key: ['user', 'me'] })
            await router.push({ name: routeNames.Login })
        }

        return Promise.reject(error)
    }
}
