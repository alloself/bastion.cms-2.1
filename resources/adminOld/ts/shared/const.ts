import type { InjectionKey } from "vue";

export const routeNames = {
    Authenticated: "Authenticated",
    Login: "Login",
    NotFound: "NotFound",
};

export const defaultTabConfig = {
    title: "Страницы",
    icon: "mdi-file",
};



export const ACTIVE_SCREEN_KEY: InjectionKey<() => boolean> =
    Symbol("hotkey-context");