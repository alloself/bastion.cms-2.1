import type { Component } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { useScreenStore } from "../features/screen";
import router from "../app/router";

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

export const resolveComponentExport = (value: unknown): unknown => {
    if (isRecord(value) && "default" in value) {
        return value.default;
    }
    return value;
};

export const isVueComponent = (value: unknown): value is Component => {
    return typeof value === "function" || isRecord(value);
};

const isModifierKeyPressed = (
    event: MouseEvent | KeyboardEvent | undefined
): boolean => {
    if (!event) {
        return false;
    }
    return event.ctrlKey || event.metaKey;
};

export const toScreenRoute = async (
    route: RouteLocationRaw | string,
    event?: Event
) => {
    const screenStore = useScreenStore();

    await router.push(route);

    if (event instanceof MouseEvent && isModifierKeyPressed(event)) {
        const activeScreen = screenStore.activeScreen;
        if (activeScreen) {
            return screenStore.openRouteTab(
                activeScreen,
                router.currentRoute.value
            );
        }
    }

    return screenStore.setActiveTabRoute(router.currentRoute.value);
};
