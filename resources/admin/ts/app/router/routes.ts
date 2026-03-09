import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/ts/shared/const'

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
    }
}

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: routeNames.Authenticated,
        component: () => import('@/ts/layouts/Authenticated.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: routeNames.Login,
        component: () => import('@/ts/pages/Login.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: routeNames.NotFound,
        redirect: '/login',
    },
]
