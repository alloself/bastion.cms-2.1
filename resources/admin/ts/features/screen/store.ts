import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { resolveModuleTabMeta } from "../../shared/modules";
import type { IScreen, ITab, TTabId } from "./types";

export const useScreenStore = defineStore("screen", () => {
    const screens = reactive<Map<string, IScreen>>(new Map());
    const activeScreenId = ref<string | null>(null);

    const getFirstScreen = () => {
        const iterator = screens.values().next();
        return iterator.value ?? null;
    };

    const getScreenById = (screenId: string | null) => {
        if (!screenId) {
            return null;
        }
        return screens.get(screenId) ?? null;
    };

    const resolveActiveScreen = () => {
        return getScreenById(activeScreenId.value) ?? getFirstScreen();
    };

    const cloneActiveTabFromActiveScreen = (): ITab | null => {
        const sourceScreen = resolveActiveScreen();
        if (!sourceScreen) {
            return null;
        }
        const activeTabId = sourceScreen.activeTabId;
        if (!activeTabId) {
            return null;
        }
        const sourceTab = sourceScreen.tabs.get(activeTabId);
        if (!sourceTab) {
            return null;
        }
        return {
            id: crypto.randomUUID(),
            route: sourceTab.route,
            title: sourceTab.title,
            icon: sourceTab.icon,
        };
    };

    const addScreen = (options?: {
        tabs?: ITab[];
        activeTabId?: TTabId | null;
    }) => {
        const initialTabs: ITab[] = options?.tabs
            ? [...options.tabs]
            : [];
        if (initialTabs.length === 0) {
            const clonedTab = cloneActiveTabFromActiveScreen();
            if (clonedTab) {
                initialTabs.push(clonedTab);
            }
        }

        const screen: IScreen = {
            id: crypto.randomUUID(),
            tabs: new Map(),
            activeTabId: options?.activeTabId ?? null,
        };
        initialTabs.forEach((tab) => {
            screen.tabs.set(tab.id, tab);
        });

        if (screen.activeTabId === null) {
            const [firstTab] = initialTabs;
            if (firstTab) {
                screen.activeTabId = firstTab.id;
            }
        }
        screens.set(screen.id, screen);
        activeScreenId.value = screen.id;
        return screen;
    };

    const addTab = (screen: IScreen, tab: ITab) => {
        screen.tabs.set(tab.id, tab);
        return tab;
    };

    const setActiveScreen = (screenId: string) => {
        if (screens.has(screenId)) {
            activeScreenId.value = screenId;
        }
    };

    const openRouteTab = (
        screen: IScreen,
        route: RouteLocationNormalizedLoaded
    ) => {
        const tabMeta = resolveModuleTabMeta(route);
        const tab = addTab(screen, {
            id: crypto.randomUUID(),
            route: route.fullPath,
            title: tabMeta.title,
            icon: tabMeta.icon,
        });
        screen.activeTabId = tab.id;
        return tab;
    };

    const closeTab = (screen: IScreen, tabId: TTabId) => {
        const orderedTabIds = Array.from(screen.tabs.keys());
        const closingIndex = orderedTabIds.indexOf(tabId);
        const remainingIds = orderedTabIds.filter((id) => id !== tabId);

        screen.tabs.delete(tabId);

        if (screen.activeTabId !== tabId) {
            return;
        }
        if (remainingIds.length === 0) {
            screen.activeTabId = null;
            return;
        }
        const previousIndex = closingIndex > 0 ? closingIndex - 1 : 0;
        const nextActiveId = remainingIds[previousIndex] ?? remainingIds[0];
        screen.activeTabId = nextActiveId ?? null;
    };

    const setActiveScreenTabRoute = (
        route: RouteLocationNormalizedLoaded
    ) => {
        const screen = resolveActiveScreen();
        if (!screen) {
            return null;
        }
        const activeTabId = screen.activeTabId;
        if (!activeTabId) {
            return openRouteTab(screen, route);
        }
        const tab = screen.tabs.get(activeTabId);
        if (!tab) {
            return openRouteTab(screen, route);
        }
        const tabMeta = resolveModuleTabMeta(route);
        tab.route = route.fullPath;
        tab.title = tabMeta.title;
        tab.icon = tabMeta.icon;
        return tab;
    };

    return {
        screens,
        activeScreenId,
        addScreen,
        closeTab,
        addTab,
        openRouteTab,
        setActiveScreen,
        setActiveScreenTabRoute,
    };
});
