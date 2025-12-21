
import { PiniaColada } from "@pinia/colada";
import { createPinia } from "pinia";
import type { App } from "vue";
import vuetify from "./vuetify";
import router from "@/ts/app/router";

export const installPlugins = (app: App) => {
    app.use(createPinia());
    app.use(PiniaColada, {});
    app.use(router);
    app.use(vuetify);
};