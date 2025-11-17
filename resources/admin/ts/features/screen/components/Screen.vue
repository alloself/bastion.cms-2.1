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
                        @click="onTabClick(toggle)"
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
        <RouterView v-slot="{ Component, route }">
            <KeepAlive>
                <Component
                    :is="Component"
                    :key="route.fullPath"
                    v-if="isActiveTab(route.fullPath)"
                />
            </KeepAlive>
        </RouterView>
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
import { computed, ref } from "vue";
import { useScreenStore } from "../store";
import type { IScreen, ITab, TTabId } from "../types";
import { useRouter } from "vue-router";
import { useScreenResizer } from "../../../shared/composables/useScreenResizer";

const { screen, isLast, nextScreen } = defineProps<{
    screen: IScreen;
    isLast: boolean;
    nextScreen?: IScreen;
}>();

const screenStore = useScreenStore();
const router = useRouter();

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
    
    if (!screenStore.screens.has(leftScreenRef.id) || !screenStore.screens.has(rightScreenRef.id)) {
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

const onTabClick = (toggle: () => void) => {
    if (isTabToggleDisabled.value && screen.activeTabId !== null) {
        return;
    }
    toggle();
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
    screenStore.closeTab(screen, tab.id);
};

const handleActivateScreen = () => {
    screenStore.setActiveScreen(screen.id);
};

const getTabRoute = (tab: ITab) => {
    if (typeof tab.route === "string") {
        return tab.route;
    }
    return router.resolve(tab.route).fullPath;
};

const activeTabRoute = computed(() => {
    const activeTabId = screen.activeTabId;
    if (!activeTabId) {
        return null;
    }
    const tab = screen.tabs.get(activeTabId);
    if (!tab) {
        return null;
    }
    return getTabRoute(tab);
});

const isActiveTab = (fullPath: string) => {
    if (!activeTabRoute.value) {
        return false;
    }
    return activeTabRoute.value === fullPath;
};
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

.screen-divider:hover,
.screen-divider.is-dragging {
    background-color: rgba(var(--v-theme-primary), 0.1);
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
