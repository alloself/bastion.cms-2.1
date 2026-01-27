import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { nextTick, onMounted, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { VCardTitle } from 'vuetify/components'

import type { TUUID } from '@/ts/shared/types'

import { useScreenStore } from '../store'
import { isTabDragData } from './useDraggableTab'

type TElementOrComponent = HTMLElement | InstanceType<typeof VCardTitle> | null

function getHtmlElement(elementOrComponent: TElementOrComponent) {
    if (!elementOrComponent) {
        return null
    }
    if (elementOrComponent instanceof HTMLElement) {
        return elementOrComponent
    }
    if ('$el' in elementOrComponent && elementOrComponent.$el instanceof HTMLElement) {
        return elementOrComponent.$el
    }
    return null
}

export interface IUseDroppableScreenOptions {
    element: MaybeRefOrGetter<TElementOrComponent>
    screenId: MaybeRefOrGetter<TUUID>
    tabsCount: MaybeRefOrGetter<number>
}

export interface IUseDroppableScreenReturn {
    isScreenDropTarget: Ref<boolean>
}

export const useDroppableScreen = ({
    element,
    screenId,
    tabsCount,
}: IUseDroppableScreenOptions) => {
    const isScreenDropTarget = ref(false)
    const screenStore = useScreenStore()
    let cleanup: (() => void) | null = null

    const setupDropTarget = () => {
        if (cleanup) {
            cleanup()
            cleanup = null
        }

        const elementOrComponent = toValue(element)
        const elementValue = getHtmlElement(elementOrComponent)
        if (!elementValue) {
            return
        }

        cleanup = dropTargetForElements({
            element: elementValue,
            canDrop: ({ source }) => {
                return isTabDragData(source.data)
            },
            getData: () => ({
                screenId: toValue(screenId),
            }),
            onDragEnter: ({ source }) => {
                if (!isTabDragData(source.data)) {
                    return
                }
                if (source.data.screenId !== toValue(screenId)) {
                    isScreenDropTarget.value = true
                }
            },
            onDragLeave: () => {
                isScreenDropTarget.value = false
            },
            onDrop: ({ source, location }) => {
                isScreenDropTarget.value = false

                if (!isTabDragData(source.data)) {
                    return
                }

                const sourceData = source.data
                const targetScreenId = toValue(screenId)
                const isSameScreen = sourceData.screenId === targetScreenId

                const hasNestedDropTarget = location.current.dropTargets.length > 1
                if (hasNestedDropTarget) {
                    return
                }

                const isClone = location.current.input.ctrlKey || location.current.input.metaKey

                const insertIndex = toValue(tabsCount)

                if (isSameScreen) {
                    if (sourceData.index !== insertIndex - 1) {
                        screenStore.reorderTabs(targetScreenId, sourceData.index, insertIndex - 1)
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
        nextTick(() => {
            setupDropTarget()
        })
    })

    onUnmounted(() => {
        if (cleanup) {
            cleanup()
        }
    })

    return {
        isScreenDropTarget,
    }
}
