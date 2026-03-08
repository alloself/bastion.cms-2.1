import { routeNames } from '@/ts/shared/const';

export const routes = [
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
