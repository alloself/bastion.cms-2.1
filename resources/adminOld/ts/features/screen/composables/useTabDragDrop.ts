import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import type { TUUID } from '@/ts/shared/types'

import { useScreenStore } from '../store'
import type { IScreen, ITab } from '../types'

interface ITabDragData {
    tabId: TUUID
    sourceScreenId: TUUID
}

const TAB_DRAG_DATA_TYPE = 'application/x-screen-tab'

const parseTabDragData = (dataTransfer: DataTransfer | null) => {
    if (!dataTransfer) {
        return null
    }

    const jsonData = dataTransfer.getData(TAB_DRAG_DATA_TYPE)
    if (!jsonData) {
        return null
    }

    try {
        const parsed = JSON.parse(jsonData) as ITabDragData

        if (!parsed) {
            return null
        }

        return parsed
    } catch {
        return null
    }
}

let emptyDragImage: HTMLCanvasElement | null = null

const getEmptyDragImage = () => {
    if (!emptyDragImage) {
        emptyDragImage = document.createElement('canvas')
        emptyDragImage.width = 1
        emptyDragImage.height = 1
    }
    return emptyDragImage
}

export function useTabDragDrop(screen: MaybeRefOrGetter<IScreen>) {
    const screenStore = useScreenStore()
    const isDragOver = ref(false)
    const customDragElement = ref<HTMLElement | null>(null)

    const createCustomDragElement = (sourceElement: HTMLElement) => {
        const clone = sourceElement.cloneNode(true) as HTMLElement
        const rect = sourceElement.getBoundingClientRect()

        clone.style.position = 'fixed'
        clone.style.pointerEvents = 'none'
        clone.style.zIndex = '9999'
        clone.style.width = `${rect.width}px`
        clone.style.opacity = '0.9'
        clone.style.left = `${rect.left}px`
        clone.style.top = `${rect.top}px`

        document.body.appendChild(clone)
        return clone
    }

    const updateDragElementPosition = (event: DragEvent) => {
        if (!customDragElement.value) {
            return
        }

        if (event.clientX === 0 && event.clientY === 0) {
            return
        }

        const elementWidth = customDragElement.value.offsetWidth
        const elementHeight = customDragElement.value.offsetHeight

        customDragElement.value.style.left = `${event.clientX - elementWidth / 2}px`
        customDragElement.value.style.top = `${event.clientY - elementHeight / 2}px`
    }

    const removeDragElement = () => {
        if (customDragElement.value) {
            customDragElement.value.remove()
            customDragElement.value = null
        }
    }

    const handleDragStart = (event: DragEvent, tab: ITab) => {
        const screenValue = toValue(screen)

        if (screenValue.tabs.size <= 1) {
            event.preventDefault()
            return
        }

        if (!event.dataTransfer) {
            return
        }

        if (event.target instanceof HTMLElement) {
            customDragElement.value = createCustomDragElement(event.target)

            const emptyImage = getEmptyDragImage()
            event.dataTransfer.setDragImage(emptyImage, 0, 0)
        }

        const dragData: ITabDragData = {
            tabId: tab.id,
            sourceScreenId: screenValue.id,
        }

        event.dataTransfer.setData(TAB_DRAG_DATA_TYPE, JSON.stringify(dragData))
        event.dataTransfer.effectAllowed = 'move'
    }

    const handleDrag = (event: DragEvent) => {
        updateDragElementPosition(event)
    }

    const handleDragEnd = () => {
        isDragOver.value = false
        removeDragElement()
    }

    const handleDragOver = (event: DragEvent) => {
        if (!event.dataTransfer) {
            return
        }

        if (event.dataTransfer.types.includes(TAB_DRAG_DATA_TYPE)) {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
        }
    }

    const handleDragEnter = (event: DragEvent) => {
        if (!event.dataTransfer) {
            return
        }

        if (event.dataTransfer.types.includes(TAB_DRAG_DATA_TYPE)) {
            isDragOver.value = true
        }
    }

    const handleDragLeave = (event: DragEvent) => {
        const relatedTarget = event.relatedTarget

        if (relatedTarget instanceof Node) {
            const currentTarget = event.currentTarget
            if (currentTarget instanceof Node && currentTarget.contains(relatedTarget)) {
                return
            }
        }

        isDragOver.value = false
    }

    const handleDrop = (event: DragEvent) => {
        isDragOver.value = false

        const dragData = parseTabDragData(event.dataTransfer)
        if (!dragData) {
            return
        }

        event.preventDefault()

        const screenValue = toValue(screen)
        const { tabId, sourceScreenId } = dragData

        screenStore.moveTabToScreen(tabId, sourceScreenId, screenValue.id)
    }

    return {
        isDragOver,
        handleDragStart,
        handleDrag,
        handleDragEnd,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
    }
}
