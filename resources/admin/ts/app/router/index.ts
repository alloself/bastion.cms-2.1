import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { guards } from "./guards";

const router = createRouter({
  history: createWebHistory('/admin'),
  routes,
});

guards.forEach(({ handler }) => router.beforeEach(handler));

export default router;
