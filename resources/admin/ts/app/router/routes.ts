import { type RouteRecordRaw } from "vue-router";
import { createModulesRoutes } from "@/ts/shared/modules";

export const routeNames = {
    Authenticated: "Authenticated",
    Login: "Login",
    NotFound: "NotFound",
};

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
