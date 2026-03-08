import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";

const router = createRouter({
    history: createWebHistory("/admin"),
    routes,
});



export default router;
