import { type RouteRecordRaw } from "vue-router";
import { routeNames } from "@admin/ts/shared/router/routeNames";
import { createModulesRoutes } from "@admin/ts/shared/modules";
import { modules } from "@admin/ts/shared/modules";

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: routeNames.Authenticated,
        component: () => import("@admin/ts/layouts/Authenticated.vue"),
        meta: { requiresAuth: true },
        children: [...createModulesRoutes(modules)],
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
