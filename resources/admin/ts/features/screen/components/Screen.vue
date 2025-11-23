<template>
    <VCard
        outlined
        rounded="0"
        flat
        class="h-100 d-flex flex-column"
        :style="{ width: screenWidth + '%', flexShrink: 0 }"
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
                @click="addScreen"
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

        <BKeepAlive
            v-if="activeTabComponent && activeTab"
            ref="keepAliveRef"
            :active-key="activeTab.id"
            :component="activeTabComponent"
            :component-props="activeTabProps"
        />
    </VCard>
    <div
        v-if="!isLast && nextScreen"
        class="screen-divider"
        :class="{ 'is-dragging': isDragging }"
        @mousedown="handleResizerMouseDown"
    >
        <div class="divider-line"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, useTemplateRef } from "vue";
import type { AsyncComponentLoader, Component } from "vue";
import { useScreenStore } from "@admin/ts/features/screen";
import type { IScreen, ITab, TTabId } from "@admin/ts/features/screen";
import { useRouter } from "vue-router";
import { useScreenResizer } from "@admin/ts/features/screen/composables/useScreenResizer";
import BKeepAlive from "@admin/ts/shared/components/BKeepAlive.vue";

const { screen, isLast, nextScreen } = defineProps<{
    screen: IScreen;
    isLast: boolean;
    nextScreen?: IScreen;
}>();

const screenStore = useScreenStore();
const router = useRouter();

const keepAliveRef = useTemplateRef<InstanceType<typeof BKeepAlive>>("keepAliveRef");

const screenWidth = computed(() => {
    return screenStore.getScreenWidth(screen.id);
});

const isDragging = ref(false);

const resizer = computed(() => {
    if (!nextScreen) {
        return null;
    }
    const leftScreenRef = screen;
    const rightScreenRef = nextScreen;

    if (
        !screenStore.screens.has(leftScreenRef.id) ||
        !screenStore.screens.has(rightScreenRef.id)
    ) {
        return null;
    }

    return useScreenResizer(leftScreenRef, rightScreenRef, {
        onDragStart: () => {
            isDragging.value = true;
        },
        onDragEnd: () => {
            isDragging.value = false;
        },
    });
});

const handleResizerMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    const resizerInstance = resizer.value;
    if (resizerInstance) {
        resizerInstance.handleMouseDown(event);
    }
};

const selectedTabId = computed({
    get: () => screen.activeTabId,
    set: (tabId: TTabId | null) => {
        screen.activeTabId = tabId;
    },
});

const isTabCloseDisabled = computed(() => {
    return screen.tabs.size === 1;
});

const isTabToggleDisabled = computed(() => {
    return screen.tabs.size === 1;
});

const onTabClick = async (toggle: () => void, tab: ITab) => {
    if (
        isTabToggleDisabled.value ||
        screen.activeTabId === tab.id ||
        !tab.route
    ) {
        return;
    }
    toggle();

    await router.push(tab.route);
    screenStore.setActiveScreenTabRoute(router.currentRoute.value);
};

const onAddTabClick = () => {
    screenStore.openRouteTab(screen, router.currentRoute.value);
};

const addScreen = () => {
    screenStore.addScreen();
};

const onRemoveScreen = () => {
    screenStore.removeScreen(screen.id);
};

const onCloseTabClick = (tab: ITab) => {
    keepAliveRef.value?.removeEntry(tab.id);
    screenStore.closeTab(screen, tab.id);
};

const handleActivateScreen = () => {
    screenStore.setActiveScreen(screen.id);
};

const activeTab = computed(() => {
    if (!screen.activeTabId) {
        return null;
    }
    const tab = screen.tabs.get(screen.activeTabId);
    if (!tab) {
        return null;
    }
    return tab;
});

const activeTabRouteLocation = computed(() => {
    if (!activeTab.value) {
        return null;
    }
    return router.resolve(activeTab.value.route);
});

const activeMatchedRecord = computed(() => {
    if (!activeTab.value) {
        return null;
    }
    const tabRouteLocation = activeTabRouteLocation.value;
    if (!tabRouteLocation) {
        return null;
    }
    const matchedRecords = tabRouteLocation.matched;
    if (matchedRecords.length === 0) {
        return null;
    }
    return matchedRecords[matchedRecords.length - 1];
});

const isAsyncComponentLoader = (
    value: unknown
): value is AsyncComponentLoader => {
    return typeof value === "function";
};

const activeTabComponent = computed<Component | null>(() => {
    const matchedRecord = activeMatchedRecord.value;
    const componentsForRecord = matchedRecord?.components;
    const componentForView = componentsForRecord?.default;

    if (!componentForView) {
        return null;
    }

    if (isAsyncComponentLoader(componentForView)) {
        return defineAsyncComponent(componentForView);
    }

    return componentForView;
});

const activeTabProps = computed<Record<string, unknown>>(() => {
    const matchedRecord = activeMatchedRecord.value;
    const routeLocation = activeTabRouteLocation.value;
    const propsForRecord = matchedRecord?.props;

    if (!matchedRecord || !routeLocation || !propsForRecord) {
        return {};
    }

    const propsForView = propsForRecord.default;

    if (!propsForView) {
        return {};
    }

    if (typeof propsForView === "boolean") {
        if (!propsForView) {
            return {};
        }
        return routeLocation.params;
    }

    if (typeof propsForView === "object") {
        return propsForView;
    }

    return {};
});
</script>

<style scoped>
.screen-chip {
    cursor: pointer;
}

.screen-divider {
    position: relative;
    width: 4px;
    margin: 0 -2px;
    flex-shrink: 0;
    cursor: col-resize;
    display: flex;
    align-items: stretch;
    justify-content: center;
    background-color: transparent;
    transition: background-color 0.2s ease;
    z-index: 1;
}

.divider-line {
    height: 100%;
    width: 1px;
    border-left: thin solid rgba(var(--v-theme-on-surface), 0.12);
    transition: border-color 0.2s ease;
    pointer-events: none;
}

.screen-divider:hover .divider-line,
.screen-divider.is-dragging .divider-line {
    border-left-color: rgb(var(--v-theme-primary));
}
</style>
