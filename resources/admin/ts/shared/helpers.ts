import { type RouteLocationRaw } from "vue-router";
import { useScreenStore } from "@admin/ts/features/screen";
import router from "../app/router";

export const isDev = () => {
    return import.meta.env.DEV;
};

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
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
        const activeScreen = screenStore.screens.get(
            screenStore.activeScreenId ?? ""
        );
        if (activeScreen) {
            screenStore.openRouteTab(activeScreen, router.currentRoute.value);
            return;
        }
    }

    screenStore.setActiveScreenTabRoute(router.currentRoute.value);
};
