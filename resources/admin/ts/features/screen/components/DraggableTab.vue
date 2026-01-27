<template>
    <VChip
        ref="chipRef"
        class="draggable-tab"
        :class="{
            'draggable-tab--dragging': isDragging,
        }"
        :color="isSelected ? 'primary' : ''"
        :prepend-icon="tab.icon"
        size="small"
        :closable="closable"
        label
        @click.stop="handleClick"
        @click:close.prevent="handleClose"
    >
        {{ tab.title }}
    </VChip>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import type { VChip } from 'vuetify/components'

import type { TUUID } from '@/ts/shared/types'

import { useDraggableTab, useDroppableTabZone } from '../composables'
import type { ITab } from '../types'

const { tab, screenId, index, isSelected, closable, canDrag } = defineProps<{
    tab: ITab
    screenId: TUUID
    index: number
    isSelected: boolean
    closable: boolean
    canDrag: boolean
}>()

const emit = defineEmits<{
    click: []
    close: []
}>()

const chipRef = useTemplateRef<InstanceType<typeof VChip>>('chipRef')

const chipElement = computed<HTMLElement | null>(() => {
    const component = chipRef.value
    if (!component) {
        return null
    }
    if ('$el' in component && component.$el instanceof HTMLElement) {
        return component.$el
    }
    return null
})

const { isDragging } = useDraggableTab({
    element: chipElement,
    tab,
    screenId,
    index,
    canDrag,
})

useDroppableTabZone({
    element: chipElement,
    screenId,
    index,
})

const handleClick = () => {
    emit('click')
}

const handleClose = () => {
    emit('close')
}
</script>

<style scoped lang="scss">
.draggable-tab {
    margin-right: 8px;
    cursor: grab;

    &--dragging {
        opacity: 0.5;
        cursor: grabbing;
    }
}
</style>
