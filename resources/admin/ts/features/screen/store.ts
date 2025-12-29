import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { IScreen, ITab } from "./types";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { getDefaultModule } from "@/ts/shared/modules";
import type { TUUID } from "@/ts/shared/types";

export const useScreenStore = defineStore("screen", () => {
    const screens = reactive<Map<TUUID, IScreen>>(new Map());
    const activeScreenId = ref<TUUID | null>(null);

    const activeScreen = computed(
        () => activeScreenId.value && screens.get(activeScreenId.value)
    );

    const getScreenWidth = (screenId: TUUID): number => {
        const screen = screens.get(screenId);
        if (!screen) {
            return 0;
        }
        if (screen.width !== 0) {
            return screen.width;
        }
        const totalScreens = screens.size;
        return totalScreens > 0 ? 100 / totalScreens : 100;
    };

    const cloneActiveTabFromActiveScreen = (): ITab | null => {
        const activeTabId = activeScreen.value?.activeTabId;
        if (!activeScreen.value || !activeTabId) {
            return null;
        }

        const sourceTab = activeScreen.value.tabs.get(activeTabId);

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

    const normalizeScreenWidths = () => {
        const totalWidth = Array.from(screens.values()).reduce(
            (sum, screen) => {
                return sum + getScreenWidth(screen.id);
            },
            0
        );

        if (totalWidth === 0) {
            return;
        }

        const factor = 100 / totalWidth;
        screens.forEach((screen) => {
            screen.width = getScreenWidth(screen.id) * factor;
        });
    };

    const addScreen = (tabs: ITab[] = [], activeTabId: TUUID | null = null) => {
        const initialTabs: ITab[] = [...tabs];
        if (!tabs.length) {
            const clonedTab = cloneActiveTabFromActiveScreen();
            if (clonedTab) {
                initialTabs.push(clonedTab);
            }
        }

        const screen: IScreen = {
            id: crypto.randomUUID(),
            tabs: new Map(),
            activeTabId: activeTabId ?? null,
            width: 0,
        };
        initialTabs.forEach((tab) => {
            screen.tabs.set(tab.id, tab);
        });

        const hasValidActiveTab =
            screen.activeTabId !== null && screen.tabs.has(screen.activeTabId);

        if (!hasValidActiveTab) {
            const [firstTab] = initialTabs;
            screen.activeTabId = firstTab ? firstTab.id : null;
        }

        const totalScreens = screens.size + 1;
        screen.width = 100 / totalScreens;

        screens.set(screen.id, screen);
        activeScreenId.value = screen.id;

        normalizeScreenWidths();

        return screen;
    };

    const addTab = (screen: IScreen, tab: ITab) => {
        screen.tabs.set(tab.id, tab);
        return tab;
    };

    const openRouteTab = (
        screen: IScreen,
        route: RouteLocationNormalizedLoaded
    ) => {
        let module = route.meta.module;

        if (!module) {
            module = getDefaultModule();
        }

        const tab = addTab(screen, {
            id: crypto.randomUUID(),
            route: route.fullPath,
            title: module?.title || "",
            icon: module?.icon || "",
        });
        screen.activeTabId = tab.id;
        return tab;
    };

    const setActiveTabRoute = (route: RouteLocationNormalizedLoaded) => {
        const module = route.meta.module;
        if (!activeScreen.value) {
            return null;
        }
        const activeTabId = activeScreen.value.activeTabId;
        if (!activeTabId) {
            return openRouteTab(activeScreen.value, route);
        }
        const tab = activeScreen.value.tabs.get(activeTabId) as ITab;

        const previousTabRoute = tab.route;
        const nextFullPath = route.fullPath;

        const isSameFullPath = previousTabRoute === nextFullPath;

        tab.route = nextFullPath;
        if (!isSameFullPath && module) {
            tab.title = module.title;
            tab.icon = module.icon;
        }

        return tab;
    };

    const setActiveScreen = (screenId: TUUID) => {
        if (screens.has(screenId)) {
            activeScreenId.value = screenId;
        }
    };

    const setActiveTab = (screenId: TUUID, tabId: TUUID) => {
        const screen = screens.get(screenId);
        if (!screen) {
            return;
        }
        if (screen.tabs.has(tabId)) {
            screen.activeTabId = tabId;
        }
    };

    const removeTab = (screenId: TUUID, tabId: TUUID): ITab | null => {
        const screen = screens.get(screenId);
        if (!screen) {
            return null;
        }
        if (screen.tabs.size <= 1) {
            return null;
        }
        const wasActive = screen.activeTabId === tabId;

        const tabsArray = Array.from(screen.tabs.values());
        const closedTabIndex = tabsArray.findIndex((tab) => tab.id === tabId);

        screen.tabs.delete(tabId);

        if (wasActive) {
            const remainingTabs = Array.from(screen.tabs.values());

            const newActiveIndex = Math.min(
                closedTabIndex > 0 ? closedTabIndex - 1 : 0,
                remainingTabs.length - 1
            );
            const nextTab = remainingTabs[newActiveIndex];
            if (nextTab) {
                screen.activeTabId = nextTab.id;
                return nextTab;
            }
            screen.activeTabId = null;
        }
        return null;
    };

    const removeScreen = (screenId: TUUID) => {
        if (screens.size <= 1) {
            return;
        }
        screens.delete(screenId);
        if (activeScreenId.value === screenId) {
            const remainingScreens = Array.from(screens.keys());
            activeScreenId.value = remainingScreens.length
                ? (remainingScreens[0] as TUUID)
                : null;
        }
        normalizeScreenWidths();
    };

    const resizeScreens = (
        screenId: TUUID,
        nextScreenId: TUUID,
        deltaPercent: number,
        startScreenWidth: number,
        startNextScreenWidth: number
    ): number | null => {
        const screen = screens.get(screenId);
        const nextScreen = screens.get(nextScreenId);
        if (!screen || !nextScreen) {
            return null;
        }

        const totalWidth = startScreenWidth + startNextScreenWidth;
        if (totalWidth <= 0) {
            return null;
        }

        const minWidthPercent = 10;
        const effectiveMinWidth = Math.min(minWidthPercent, totalWidth / 2);

        const maxWidth = totalWidth - effectiveMinWidth;
        const unclampedWidth = startScreenWidth + deltaPercent;
        const newScreenWidth = Math.max(
            effectiveMinWidth,
            Math.min(maxWidth, unclampedWidth)
        );

        const newNextScreenWidth = totalWidth - newScreenWidth;

        screen.width = newScreenWidth;
        nextScreen.width = newNextScreenWidth;

        return newScreenWidth;
    };

    return {
        screens,
        activeScreen,
        addScreen,
        openRouteTab,
        setActiveTabRoute,
        setActiveScreen,
        setActiveTab,
        removeTab,
        removeScreen,
        normalizeScreenWidths,
        getScreenWidth,
        resizeScreens,
    };
});
