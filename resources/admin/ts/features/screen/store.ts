import { defineStore } from "pinia";
import { reactive, ref, watch } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { resolveModuleTabMeta } from "@admin/ts/shared/modules";
import type { IScreen, ITab, TTabId } from "@admin/ts/features/screen/types";

type SerializableScreen = Omit<IScreen, "tabs"> & {
    tabs: ITab[];
};

interface StoredState {
    screens: SerializableScreen[];
    activeScreenId: string | null;
}

interface ISetRouteTabOptions {
    title?: string;
    icon?: string;
}

export const useScreenStore = defineStore("screen", () => {
    const screens = reactive<Map<string, IScreen>>(new Map());
    const activeScreenId = ref<string | null>(null);

    const storedState = useLocalStorage<StoredState | null>("screen-state", null, {
        serializer: {
            read: (value: string) => {
                try {
                    return JSON.parse(value) as StoredState;
                } catch {
                    return null;
                }
            },
            write: (value: StoredState | null) => {
                return JSON.stringify(value);
            },
        },
    });

    const serializeState = (): StoredState => {
        const serializableScreens: SerializableScreen[] = Array.from(screens.values()).map((screen) => ({
            ...screen,
            tabs: Array.from(screen.tabs.values()),
        }));

        return {
            screens: serializableScreens,
            activeScreenId: activeScreenId.value,
        };
    };

    const deserializeState = (state: StoredState): void => {
        screens.clear();
        
        state.screens.forEach((serializableScreen) => {
            const screen: IScreen = {
                ...serializableScreen,
                tabs: new Map(serializableScreen.tabs.map((tab) => [tab.id, tab])),
            };
            
            screens.set(screen.id, screen);
        });
        
        if (state.activeScreenId && screens.has(state.activeScreenId)) {
            activeScreenId.value = state.activeScreenId;
        } else if (screens.size > 0) {
            const firstScreenId = Array.from(screens.keys())[0];
            if (firstScreenId) {
                activeScreenId.value = firstScreenId;
            }
        }
    };

    const getScreenWidth = (screenId: string): number => {
        const screen = screens.get(screenId);
        if (!screen) {
            return 0;
        }
        if (screen.width !== undefined) {
            return screen.width;
        }
        const totalScreens = screens.size;
        return totalScreens > 0 ? 100 / totalScreens : 100;
    };

    const normalizeScreenWidths = () => {
        const totalWidth = Array.from(screens.values()).reduce((sum, screen) => {
            return sum + getScreenWidth(screen.id);
        }, 0);

        if (totalWidth === 0) {
            return;
        }

        const factor = 100 / totalWidth;
        screens.forEach((screen) => {
            screen.width = getScreenWidth(screen.id) * factor;
        });
        storedState.value = serializeState();
    };

    const setScreenWidth = (screenId: string, width: number, normalize = true) => {
        const screen = screens.get(screenId);
        if (!screen) {
            return;
        }
        screen.width = width;
        if (normalize) {
            normalizeScreenWidths();
        }
    };

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

    const setTabTitle = (screenId: string, tabId: TTabId, title: string) => {
        const nextTitle = title.trim();
        if (nextTitle === "") {
            return;
        }

        const screen = screens.get(screenId);
        if (!screen) {
            return;
        }

        const tab = screen.tabs.get(tabId);
        if (!tab) {
            return;
        }

        if (tab.title !== nextTitle) {
            tab.title = nextTitle;
        }
    };

    const setActiveScreen = (screenId: string) => {
        if (screens.has(screenId)) {
            activeScreenId.value = screenId;
        }
    };

    const removeScreen = (screenId: string) => {
        screens.delete(screenId);
        if (screens.size > 0) {
            normalizeScreenWidths();
        }
    };

    const openRouteTab = (
        screen: IScreen,
        route: RouteLocationNormalizedLoaded,
        options?: ISetRouteTabOptions
    ) => {
        const tabMeta = resolveModuleTabMeta(route);
        const overrideTitle =
            typeof options?.title === "string" ? options.title.trim() : "";
        const resolvedTitle = overrideTitle !== "" ? overrideTitle : tabMeta.title;
        const tab = addTab(screen, {
            id: crypto.randomUUID(),
            route: route.fullPath,
            title: resolvedTitle,
            icon: options?.icon ?? tabMeta.icon,
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
        route: RouteLocationNormalizedLoaded,
        options?: ISetRouteTabOptions
    ) => {
        const screen = resolveActiveScreen();
        if (!screen) {
            return null;
        }
        const activeTabId = screen.activeTabId;
        if (!activeTabId) {
            return openRouteTab(screen, route, options);
        }
        const tab = screen.tabs.get(activeTabId);
        if (!tab) {
            return openRouteTab(screen, route, options);
        }
        const tabMeta = resolveModuleTabMeta(route);
        const overrideTitle =
            typeof options?.title === "string" ? options.title.trim() : "";
        const resolvedTitle = overrideTitle !== "" ? overrideTitle : tabMeta.title;

        const previousTabRoute = tab.route;
        const nextFullPath = route.fullPath;

        const isSameFullPath = previousTabRoute === nextFullPath;

        const shouldPreserveTitle =
            isSameFullPath &&
            tab.title !== "" &&
            tab.title !== tabMeta.title;

        tab.route = nextFullPath;
        if (!shouldPreserveTitle) {
            tab.title = resolvedTitle;
        }
        tab.icon = options?.icon ?? tabMeta.icon;
        return tab;
    };

    const syncActiveTabWithRoute = (route: RouteLocationNormalizedLoaded) => {
        const targetFullPath = route.fullPath;

        const activeScreenCandidate = getScreenById(activeScreenId.value);
        if (activeScreenCandidate) {
            for (const tab of activeScreenCandidate.tabs.values()) {
                if (typeof tab.route === "string" && tab.route === targetFullPath) {
                    activeScreenId.value = activeScreenCandidate.id;
                    activeScreenCandidate.activeTabId = tab.id;
                    return setActiveScreenTabRoute(route);
                }
            }
        }

        for (const screen of screens.values()) {
            const shouldSkipScreen =
                activeScreenCandidate !== null &&
                screen.id === activeScreenCandidate.id;

            if (!shouldSkipScreen) {
                for (const tab of screen.tabs.values()) {
                    if (typeof tab.route === "string" && tab.route === targetFullPath) {
                        activeScreenId.value = screen.id;
                        screen.activeTabId = tab.id;
                        return setActiveScreenTabRoute(route);
                    }
                }
            }
        }

        return setActiveScreenTabRoute(route);
    };

    const initializeState = () => {
        if (storedState.value && storedState.value.screens.length > 0) {
            deserializeState(storedState.value);
            normalizeScreenWidths();
            return true;
        }
        return false;
    };

    const initializeWidths = () => {
        if (screens.size > 0) {
            screens.forEach((screen) => {
                if (screen.width === undefined) {
                    const totalScreens = screens.size;
                    screen.width = totalScreens > 0 ? 100 / totalScreens : 100;
                }
            });
            normalizeScreenWidths();
        }
    };

    let isUpdatingFromStorage = false;

    watch(
        storedState,
        (newState) => {
            if (isUpdatingFromStorage) {
                return;
            }
            if (newState && newState.screens.length > 0) {
                const currentState = serializeState();
                const currentStateStr = JSON.stringify(currentState);
                const newStateStr = JSON.stringify(newState);
                
                if (currentStateStr !== newStateStr) {
                    isUpdatingFromStorage = true;
                    deserializeState(newState);
                    normalizeScreenWidths();
                    isUpdatingFromStorage = false;
                }
            }
        },
        { immediate: true }
    );

    if (typeof window !== "undefined") {
        const stateLoaded = initializeState();
        if (!stateLoaded) {
            watch(
                () => screens.size,
                () => {
                    if (screens.size > 0) {
                        initializeWidths();
                    }
                },
                { immediate: true }
            );
        }
    }

    watch(
        () => [
            Array.from(screens.values()).map((screen) => ({
                id: screen.id,
                tabs: Array.from(screen.tabs.values()),
                activeTabId: screen.activeTabId,
                width: screen.width,
            })),
            activeScreenId.value,
        ],
        () => {
            if (!isUpdatingFromStorage) {
                storedState.value = serializeState();
            }
        },
        { deep: true }
    );

    return {
        screens,
        activeScreenId,
        addScreen,
        closeTab,
        addTab,
        setTabTitle,
        openRouteTab,
        setActiveScreen,
        syncActiveTabWithRoute,
        setActiveScreenTabRoute,
        getScreenWidth,
        setScreenWidth,
        normalizeScreenWidths,
        removeScreen,
    };
});
