import type { RouteLocationRaw } from "vue-router";
import type { Component } from "vue";
import { nextTick } from "vue";
import { useRouter } from "vue-router";
import { useScreenStore } from "../store";
import { isObject } from "lodash";

export const resolveComponentExport = (value: unknown) => {
    if (isObject(value) && "default" in value) {
        return value.default;
    }
    return value;
};

export const isVueComponent = (value: unknown): value is Component => {
    return typeof value === "function" || isObject(value);
};

const isModifierKeyPressed = (
    event: MouseEvent | KeyboardEvent | undefined
) => {
    if (!event) {
        return false;
    }
    return event.ctrlKey || event.metaKey;
};

export const useScreenNavigation = () => {
    const router = useRouter();
    const screenStore = useScreenStore();

    const toScreenRoute = async (
        route: RouteLocationRaw | string,
        event?: Event
    ) => {
        await router.push(route);
        await nextTick();

        if (event instanceof MouseEvent && isModifierKeyPressed(event)) {
            const activeScreen = screenStore.activeScreen;
            if (activeScreen) {
                return screenStore.openRouteTab(activeScreen, router.currentRoute.value);
            }
        }

        return screenStore.setActiveTabRoute(router.currentRoute.value);
    };

    return { toScreenRoute };
};
