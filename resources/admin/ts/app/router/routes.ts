import { type RouteRecordRaw } from "vue-router";
import { routeNames } from "@admin/ts/app/router/routeNames";

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: routeNames.Authenticated,
        component: () => import("@admin/ts/layouts/Authenticated.vue"),
        meta: { requiresAuth: true },
        children: [
            
        ],
    },
    {
        path: "/login",
        name: routeNames.Login,
        component: () => import("@admin/ts/pages/Login.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: routeNames.NotFound,
        redirect: "/login",
    },
];
