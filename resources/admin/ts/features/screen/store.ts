import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { IScreen, ITab, TUUID } from "./types";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { IModule } from "@/ts/shared/modules";

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

        if (screen.activeTabId === null) {
            const [firstTab] = initialTabs;
            if (firstTab) {
                screen.activeTabId = firstTab.id;
            }
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
        const module = route.meta.module as IModule | undefined;

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
        const module = route.meta.module as IModule;
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
        if (!isSameFullPath) {
            tab.title = module.title;
            tab.icon = module.icon;
        }

        return tab;
    };

    return {
        screens,
        activeScreen,
        addScreen,
        openRouteTab,
        setActiveTabRoute,
    };
});
