import { type RouteRecordRaw } from "vue-router";
import { createModulesRoutes } from "@/ts/widgets";
import { routeNames } from "@/ts/shared";

export { routeNames };

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: routeNames.Authenticated,
        component: () => import("@/ts/layouts/Authenticated.vue"),
        meta: { requiresAuth: true },
        children: [...createModulesRoutes()],
    },
    {
        path: "/login",
        name: routeNames.Login,
        component: () => import("@/ts/pages/Login.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: routeNames.NotFound,
        redirect: "/login",
    },
];
