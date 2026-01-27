import {
    attachClosestEdge,
    extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { onMounted, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

import type { TUUID } from '@/ts/shared/types'

import { useScreenStore } from '../store'
import { TAB_DRAG_TYPE, isTabDragData } from './useDraggableTab'

export interface IUseDroppableTabZoneOptions {
    element: MaybeRefOrGetter<HTMLElement | null>
    screenId: MaybeRefOrGetter<TUUID>
    index: MaybeRefOrGetter<number>
}

export interface IUseDroppableTabZoneReturn {
    isDropTarget: Ref<boolean>
    closestEdge: Ref<Edge | null>
}

export function useDroppableTabZone({ element, screenId, index }: IUseDroppableTabZoneOptions) {
    const isDropTarget = ref(false)
    const closestEdge = ref<Edge | null>(null)
    const screenStore = useScreenStore()
    let cleanup: (() => void) | null = null

    const setupDropTarget = () => {
        if (cleanup) {
            cleanup()
            cleanup = null
        }

        const elementValue = toValue(element)
        if (!elementValue) {
            return
        }

        cleanup = dropTargetForElements({
            element: elementValue,
            canDrop: ({ source }) => {
                return isTabDragData(source.data)
            },
            getData: ({ input, element: dropElement }) => {
                const data = {
                    type: TAB_DRAG_TYPE,
                    screenId: toValue(screenId),
                    index: toValue(index),
                }

                return attachClosestEdge(data, {
                    element: dropElement,
                    input,
                    allowedEdges: ['left', 'right'],
                })
            },
            onDragEnter: ({ self }) => {
                isDropTarget.value = true
                closestEdge.value = extractClosestEdge(self.data)
            },
            onDrag: ({ self }) => {
                closestEdge.value = extractClosestEdge(self.data)
            },
            onDragLeave: () => {
                isDropTarget.value = false
                closestEdge.value = null
            },
            onDrop: ({ source, self, location }) => {
                isDropTarget.value = false
                closestEdge.value = null

                if (!isTabDragData(source.data)) {
                    return
                }

                const sourceData = source.data
                const targetScreenId = toValue(screenId)
                const targetIndex = toValue(index)
                const edge = extractClosestEdge(self.data)

                const isClone = location.current.input.ctrlKey || location.current.input.metaKey

                const isSameScreen = sourceData.screenId === targetScreenId
                const insertIndex = edge === 'right' ? targetIndex + 1 : targetIndex

                if (isSameScreen) {
                    const adjustedIndex =
                        sourceData.index < insertIndex ? insertIndex - 1 : insertIndex

                    if (sourceData.index !== adjustedIndex) {
                        screenStore.reorderTabs(targetScreenId, sourceData.index, adjustedIndex)
                    }
                } else {
                    if (isClone) {
                        screenStore.cloneTabToScreen(
                            sourceData.screenId,
                            sourceData.tabId,
                            targetScreenId,
                            insertIndex,
                        )
                    } else {
                        screenStore.moveTabToScreen(
                            sourceData.screenId,
                            sourceData.tabId,
                            targetScreenId,
                            insertIndex,
                        )
                    }
                }
            },
        })
    }

    watch(
        () => element,
        () => {
            setupDropTarget()
        },
    )

    onMounted(() => {
        setupDropTarget()
    })

    onUnmounted(() => {
        if (cleanup) {
            cleanup()
        }
    })

    return {
        isDropTarget,
        closestEdge,
    }
}
