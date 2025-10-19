import { type RouteRecordRaw } from "vue-router";


export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Authenticated",
        component: () => import("@admin/ts/layouts/Authenticated.vue"),
        children: [],
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@admin/ts/pages/Login.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        redirect: "/login",
    },
];
