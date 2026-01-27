<template>
    <VCard
        ref="screenCardRef"
        outlined
        rounded="0"
        flat
        class="h-100 d-flex flex-column"
        :style="{ width: screen.width + '%', flexShrink: 0 }"
        @pointerdown="handleActivateScreen"
    >
        <VCardTitle
            ref="cardTitleRef"
            class="d-flex align-center px-2 screen-card-title"
            :class="{
                'ga-2': screen.tabs.size > 0,
                'screen-card-title--drop-target': isScreenDropTarget,
            }"
        >
            <VSlideGroup v-model="selectedTabId" show-arrows item-value="id">
                <DraggableTab
                    v-for="(tab, tabIndex) in tabsArray"
                    :key="tab.id"
                    :tab="tab"
                    :screen-id="screen.id"
                    :index="tabIndex"
                    :is-selected="screen.activeTabId === tab.id"
                    :closable="!isTabCloseDisabled"
                    :can-drag="canDragTab"
                    @click="onDraggableTabClick(tab)"
                    @close="onCloseTabClick(tab)"
                />
            </VSlideGroup>

            <VBtn
                size="x-small"
                icon="mdi-plus"
                variant="flat"
                @click="onAddTabClick"
            />
            <VSpacer></VSpacer>
            <VBtn
                size="x-small"
                icon="mdi-dock-window"
                variant="flat"
                @click="screenStore.addScreen()"
            />
            <VBtn
                v-if="screenStore.screens.size > 1"
                size="x-small"
                icon="mdi-close"
                variant="flat"
                @click="onRemoveScreen"
            />
        </VCardTitle>
        <VDivider />
        <Component
            :is="activeTabComponent"
            :key="activeTabKey"
            v-bind="activeTabProps"
            :tab="activeTab"
        />
    </VCard>
    <div
        v-if="!isLast && nextScreen"
        class="screen-divider"
        :class="{ 'is-dragging': isDragging }"
        @pointerdown="handleResizerPointerDown"
    >
        <div class="divider-line"></div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    defineAsyncComponent,
    ref,
    watch,
    useTemplateRef,
    provide,
} from "vue";
import type { Component } from "vue";
import { useRouter, type RouteLocationResolved } from "vue-router";
import { useScreenStore, type IScreen, type ITab } from "..";
import type { TUUID } from "@/ts/shared/types";
import {
    useScreenResize,
    isVueComponent,
    resolveComponentExport,
    useDroppableScreen,
} from "../composables";

import type { VCard, VCardTitle } from "vuetify/components";
import ScreenTabLoading from "./ScreenTabLoading.vue";
import DraggableTab from "./DraggableTab.vue";
import { isObject } from "lodash";
import { ACTIVE_SCREEN_KEY } from "@/ts/shared/const";

const { screen, isLast, nextScreen } = defineProps<{
    screen: IScreen;
    isLast: boolean;
    nextScreen?: IScreen;
}>();

const screenStore = useScreenStore();
const router = useRouter();

provide(ACTIVE_SCREEN_KEY, () => screenStore.activeScreen?.id === screen.id);

const screenCardRef =
    useTemplateRef<InstanceType<typeof VCard>>("screenCardRef");
const cardTitleRef =
    useTemplateRef<InstanceType<typeof VCardTitle>>("cardTitleRef");

const { isDragging, handleResizerPointerDown } = useScreenResize({
    screen: () => screen,
    nextScreen: () => nextScreen,
    screenCardRef,
});

const { isScreenDropTarget } = useDroppableScreen({
    element: cardTitleRef,
    screenId: screen.id,
    tabsCount: screen.tabs.size,
});

const selectedTabId = ref<TUUID | null>(screen.activeTabId);

const renderComponent = (routeComponent: unknown): Component | null => {
    if (!routeComponent) {
        return null;
    }

    if (typeof routeComponent === "function") {
        const asyncComponent = defineAsyncComponent({
            loader: async () => {
                try {
                    const resolvedExport = resolveComponentExport(
                        await routeComponent()
                    );

                    if (isVueComponent(resolvedExport)) {
                        return resolvedExport;
                    }

                    throw new Error("Failed to load screen tab component.");
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            loadingComponent: ScreenTabLoading,
        });

        return asyncComponent;
    }

    if (isVueComponent(routeComponent)) {
        return routeComponent;
    }

    return null;
};

const extractRouteProps = (
    propsConfig: unknown,
    route: RouteLocationResolved
) => {
    if (!propsConfig) {
        return {};
    }
    if (typeof propsConfig === "function") {
        const result = propsConfig(route);
        if (isObject(result)) {
            return result;
        }
        return {};
    }
    if (isObject(propsConfig)) {
        return propsConfig;
    }
    return {};
};

const activeTab = computed(() => {
    if (!screen.activeTabId) {
        return null;
    }
    return screen.tabs.get(screen.activeTabId) || null;
});

const activeTabKey = computed(() => {
    if (!activeTab.value) {
        return null;
    }
    return `${activeTab.value.id}-${activeTab.value.route}`;
});

const resolvedTabRoute = computed(() => {
    if (!activeTab.value) {
        return null;
    }
    return router.resolve(activeTab.value.route);
});

const activeTabRoute = computed(() => {
    if (!resolvedTabRoute.value) {
        return null;
    }
    const { matched } = resolvedTabRoute.value;
    return matched[matched.length - 1] ?? null;
});

const activeTabComponent = computed(() => {
    if (!activeTabRoute.value) {
        return null;
    }
    const component = activeTabRoute.value.components?.default;
    if (!component) {
        return null;
    }
    return renderComponent(component);
});

const activeTabProps = computed(() => {
    if (!activeTabRoute.value || !resolvedTabRoute.value) {
        return {};
    }
    return extractRouteProps(
        activeTabRoute.value.props.default,
        resolvedTabRoute.value
    );
});

const isTabCloseDisabled = computed(() => {
    return screen.tabs.size <= 1;
});

const tabsArray = computed(() => Array.from(screen.tabs.values()));

const canDragTab = computed(() => {
    return screen.tabs.size > 1 || screenStore.screens.size > 1;
});

const handleActivateScreen = () => {
    const wasAlreadyActive = screenStore.activeScreen?.id === screen.id;
    screenStore.setActiveScreen(screen.id);

    if (wasAlreadyActive || !activeTab.value?.route) {
        return;
    }

    const targetRoute = activeTab.value.route;
    requestAnimationFrame(() => {
        router.replace(targetRoute);
    });
};

const isTabToggleDisabled = computed(() => {
    return screen.tabs.size === 1;
});

const onDraggableTabClick = (tab: ITab) => {
    if (isTabToggleDisabled.value || screen.activeTabId === tab.id || !tab.route) {
        return;
    }
    screenStore.setActiveTab(screen.id, tab.id);
    selectedTabId.value = tab.id;

    requestAnimationFrame(() => {
        router.replace(tab.route);
    });
};

const onCloseTabClick = (tab: ITab) => {
    const nextTab = screenStore.removeTab(screen.id, tab.id);
    if (nextTab) {
        requestAnimationFrame(() => {
            router.push(nextTab.route);
        });
    }
};

const onAddTabClick = () => {
    const currentRoute = router.currentRoute.value;
    screenStore.openRouteTab(screen, currentRoute);
};

const onRemoveScreen = () => {
    if (screenStore.screens.size <= 1) {
        return;
    }
    screenStore.removeScreen(screen.id);
};

watch(
    () => screen.activeTabId,
    (newId) => {
        selectedTabId.value = newId;
    }
);

watch(
    () => selectedTabId.value,
    (newId) => {
        if (newId && newId !== screen.activeTabId) {
            const tab = screen.tabs.get(newId);
            if (tab) {
                screenStore.setActiveTab(screen.id, newId);
                requestAnimationFrame(() => {
                    router.replace(tab.route);
                });
            }
        }
    }
);
</script>

<style scoped lang="scss">
.screen-card-title {
    transition: background-color 0.2s ease;

    &--drop-target {
        background-color: rgba(var(--v-theme-primary), 0.1);
    }
}

.screen {
    &-chip {
        cursor: pointer;
    }
    &-divider {
        position: relative;
        width: 4px;
        margin: 0 -2px;
        flex-shrink: 0;
        cursor: col-resize;
        touch-action: none;
        display: flex;
        align-items: stretch;
        justify-content: center;
        background-color: transparent;
        transition: background-color 0.2s ease;
        z-index: 1;

        &:hover .divider-line,
        &.is-dragging .divider-line {
            border-left-color: rgb(var(--v-theme-primary));
        }
    }
}

.divider-line {
    height: 100%;
    width: 1px;
    border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

    transition: border-color 0.2s ease;
    pointer-events: none;
}
</style>
