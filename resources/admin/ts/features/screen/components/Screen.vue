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

        <KeepAlive
            v-if="activeTabComponent && activeTab"
            :active-key="activeTabKey"
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
import { useScreenStore, type IScreen } from "..";

const { screen, isLast, nextScreen } = defineProps<{
    screen: IScreen;
    isLast: boolean;
    nextScreen?: IScreen;
}>();

const screenStore = useScreenStore();
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
