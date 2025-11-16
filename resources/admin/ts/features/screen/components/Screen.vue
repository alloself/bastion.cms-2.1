<template>
    <VCard
        outlined
        rounded="0"
        flat
        class="h-100 d-flex flex-column w-100"
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
    <VDivider vertical class="divider"></VDivider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useScreenStore } from "../store";
import type { IScreen, ITab, TTabId } from "../types";
import { useRouter } from "vue-router";

const { screen } = defineProps<{
    screen: IScreen;
}>();

const screenStore = useScreenStore();
const router = useRouter();

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
    screenStore.screens.delete(screen.id);
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
</style>
