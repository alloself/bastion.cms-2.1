import { type RouteLocationRaw } from "vue-router";
import type { ISortBy } from "@/admin/ts/shared/types";
import { useScreenStore } from "@admin/ts/features/screen";
import router from "../app/router";

export const isDev = () => {
    return import.meta.env.DEV;
};

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

export const parseIntegerParam = (value: string | null, fallback: number) => {
    if (!value) {
        return fallback;
    }
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return fallback;
    }
    return parsedValue;
};

export const parseSortByParam = (rawValue: string): ISortBy | null => {
    const [key, order] = rawValue.split(":");
    if (!key || (order !== "asc" && order !== "desc")) {
        return null;
    }

    return { key, order };
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
    event?: Event,
    options?: {
        tabTitle?: string;
        tabIcon?: string;
    }
) => {
    const screenStore = useScreenStore();

    await router.push(route);

    const titleOverride = options?.tabTitle?.trim() ?? "";
    const iconOverride = options?.tabIcon;

    if (event instanceof MouseEvent && isModifierKeyPressed(event)) {
        const activeScreen = screenStore.screens.get(
            screenStore.activeScreenId ?? ""
        );
        if (activeScreen) {
            screenStore.openRouteTab(activeScreen, router.currentRoute.value, {
                title: titleOverride,
                icon: iconOverride,
            });
            return;
        }
    }

    screenStore.setActiveScreenTabRoute(router.currentRoute.value, {
        title: titleOverride,
        icon: iconOverride,
    });
};
