import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { onMounted, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import type { TUUID } from '@/ts/shared/types'

import type { ITab, ITabDragData } from '../types'

export interface IUseDraggableTabOptions {
    element: MaybeRefOrGetter<HTMLElement | null>
    tab: MaybeRefOrGetter<ITab>
    screenId: MaybeRefOrGetter<TUUID>
    index: MaybeRefOrGetter<number>
    canDrag?: MaybeRefOrGetter<boolean>
}

export const TAB_DRAG_TYPE = 'tab'

export function isTabDragData(data: Record<string, unknown>): data is ITabDragData {
    return data.type === TAB_DRAG_TYPE
}

export function useDraggableTab({
    element,
    tab,
    screenId,
    index,
    canDrag,
}: IUseDraggableTabOptions) {
    const isDragging = ref(false)
    let cleanup: (() => void) | null = null

    const setupDraggable = () => {
        if (cleanup) {
            cleanup()
            cleanup = null
        }

        const elementValue = toValue(element)
        if (!elementValue) {
            return
        }

        cleanup = draggable({
            element: elementValue,
            canDrag: () => {
                const canDragValue = canDrag !== undefined ? toValue(canDrag) : true
                return canDragValue
            },
            getInitialData: (): ITabDragData => ({
                type: TAB_DRAG_TYPE,
                tabId: toValue(tab).id,
                screenId: toValue(screenId),
                tab: toValue(tab),
                index: toValue(index),
            }),
            onGenerateDragPreview: ({ nativeSetDragImage, source, location }) => {
                const sourceRect = source.element.getBoundingClientRect()
                const cursorOffsetX = location.current.input.clientX - sourceRect.left
                const cursorOffsetY = location.current.input.clientY

                setCustomNativeDragPreview({
                    getOffset: () => ({ x: cursorOffsetX, y: cursorOffsetY }),
                    render: ({ container }) => {
                        const preview = source.element.cloneNode(true)
                        if (preview instanceof HTMLElement) {
                            const computedStyle = window.getComputedStyle(source.element)
                            preview.style.width = computedStyle.width
                            preview.style.height = computedStyle.height
                            preview.style.opacity = '1'
                        }
                        container.appendChild(preview)
                    },
                    nativeSetDragImage,
                })
            },
            onDragStart: () => {
                isDragging.value = true
            },
            onDrop: () => {
                isDragging.value = false
            },
        })
    }

    watch(
        () => element,
        () => {
            setupDraggable()
        },
    )

    onMounted(() => {
        setupDraggable()
    })

    onUnmounted(() => {
        if (cleanup) {
            cleanup()
        }
    })

    return {
        isDragging,
    }
}
