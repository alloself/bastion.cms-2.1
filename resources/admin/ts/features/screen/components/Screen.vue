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
            class="d-flex align-center px-2"
            :class="{ 'ga-2': screen.tabs.size > 0 }"
        >
            <VSlideGroup v-model="selectedTabId" show-arrows item-value="id">
                <VSlideGroupItem
                    v-for="tab in screen.tabs.values()"
                    :key="tab.id"
                    :value="tab.id"
                    v-slot="{ isSelected, toggle }"
                >
                    <VChip
                        class="screen-chip mr-2"
                        :color="isSelected ? 'primary' : ''"
                        :prepend-icon="tab.icon"
                        size="small"
                        @click.stop="onTabClick(toggle, tab)"
                        :closable="!isTabCloseDisabled"
                        @click:close.prevent="onCloseTabClick(tab)"
                        label
                    >
                        {{ tab.title }}
                    </VChip>
                </VSlideGroupItem>
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

        <KeepAlive
            v-if="activeTabComponent && activeTab && activeTabKey"
            :key="activeTabKey"
        >
            <component
                :is="activeTabComponent"
                v-bind="activeTabProps"
                :tab="activeTab"
            />
        </KeepAlive>
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
} from "vue";
import type { Component } from "vue";
import { useRouter, type RouteLocationResolved } from "vue-router";
import { useScreenStore, type IScreen, type ITab } from "..";
import type { TUUID } from "@/ts/shared/types";
import { useScreenResize, isVueComponent, resolveComponentExport } from "../composables";
import type { VCard } from "vuetify/components";
import ScreenTabLoading from "./ScreenTabLoading.vue";
import { isObject } from "lodash";

const { screen, isLast, nextScreen } = defineProps<{
    screen: IScreen;
    isLast: boolean;
    nextScreen?: IScreen;
}>();

const screenStore = useScreenStore();
const router = useRouter();

const screenCardRef =
    useTemplateRef<InstanceType<typeof VCard>>("screenCardRef");

const { isDragging, handleResizerPointerDown } = useScreenResize({
    screen: () => screen,
    nextScreen: () => nextScreen,
    screenCardRef,
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
    return activeTab.value?.id || null;
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

const handleActivateScreen = () => {
    screenStore.setActiveScreen(screen.id);
    
    if (activeTab.value?.route) {
        router.push(activeTab.value.route);
    }
};

const isTabToggleDisabled = computed(() => {
    return screen.tabs.size === 1;
});

const onTabClick = (toggle: () => void, tab: ITab) => {
    if (
        isTabToggleDisabled.value ||
        screen.activeTabId === tab.id ||
        !tab.route
    ) {
        return;
    }
    toggle();
    screenStore.setActiveTab(screen.id, tab.id);
    router.push(tab.route);
};

const onCloseTabClick = (tab: ITab) => {
    const nextTab = screenStore.removeTab(screen.id, tab.id);
    if (nextTab) {
        router.push(nextTab.route);
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
                router.push(tab.route);
            }
        }
    }
);
</script>

<style scoped lang="scss">
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
