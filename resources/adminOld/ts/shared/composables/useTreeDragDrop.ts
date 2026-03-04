import { type MaybeRefOrGetter, ref, toValue } from 'vue'

import { traverseTree } from '@/ts/shared/helpers'
import type { IBaseTreeEntity } from '@/ts/shared/types'

const TREE_NODE_DRAG_TYPE = 'application/x-tree-node'

interface ITreeNodeDragData {
    nodeId: string
    parentId: string | null
}

interface ITreeDragDropOptions {
    onMoveNode: (nodeId: string, newParentId: string) => void | Promise<void>
}

const parseTreeNodeDragData = (dataTransfer: DataTransfer | null) => {
    if (!dataTransfer) {
        return null
    }

    const jsonData = dataTransfer.getData(TREE_NODE_DRAG_TYPE)
    if (!jsonData) {
        return null
    }

    try {
        return JSON.parse(jsonData) as ITreeNodeDragData
    } catch {
        return null
    }
}

const isDescendantOf = <T extends IBaseTreeEntity<T>>(node: T, targetId: string) => {
    let found = false

    if (node.children && node.children.length) {
        traverseTree(node.children, (child) => {
            if (child.id === targetId) {
                found = true
            }
        })
    }

    return found
}

const findNodeById = <T extends IBaseTreeEntity<T>>(tree: T[], nodeId: string) => {
    let result: T | null = null

    traverseTree(tree, (item) => {
        if (item.id === nodeId) {
            result = item
        }
    })

    return result
}

let emptyDragImage: HTMLCanvasElement | null = null

const getEmptyDragImage = (): HTMLCanvasElement => {
    if (!emptyDragImage) {
        emptyDragImage = document.createElement('canvas')
        emptyDragImage.width = 1
        emptyDragImage.height = 1
    }
    return emptyDragImage
}

const createCustomDragElement = (sourceElement: HTMLElement) => {
    const clone = sourceElement.cloneNode(true)

    if (!(clone instanceof HTMLElement)) {
        const fallback = document.createElement('div')
        fallback.textContent = sourceElement.textContent?.trim() ?? ''
        document.body.appendChild(fallback)
        return fallback
    }

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

export function useTreeDragDrop<T extends IBaseTreeEntity<T>>(
    treeItems: MaybeRefOrGetter<T[]>,
    options: ITreeDragDropOptions,
) {
    const draggedNodeId = ref<string | null>(null)
    const dropTargetNodeId = ref<string | null>(null)
    const customDragElement = ref<HTMLElement | null>(null)

    const updateDragElementPosition = (event: DragEvent) => {
        if (!customDragElement.value) {
            return
        }

        if (!event.clientX || !event.clientY) {
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

    const isValidDropTarget = (dragData: ITreeNodeDragData, targetNodeId: string) => {
        if (dragData.nodeId === targetNodeId) {
            return false
        }

        if (dragData.parentId === targetNodeId) {
            return false
        }

        const items = toValue(treeItems)
        const draggedNode = findNodeById(items, dragData.nodeId)

        if (!draggedNode) {
            return false
        }

        if (isDescendantOf(draggedNode, targetNodeId)) {
            return false
        }

        return true
    }

    const handleDragStart = (event: DragEvent, item: T) => {
        if (!event.dataTransfer || !item.id) {
            return
        }

        if (event.target instanceof HTMLElement) {
            const listItemElement = event.target.closest('.v-list-item')

            if (listItemElement instanceof HTMLElement) {
                customDragElement.value = createCustomDragElement(listItemElement)
                event.dataTransfer.setDragImage(getEmptyDragImage(), 0, 0)
            }
        }

        const dragData: ITreeNodeDragData = {
            nodeId: item.id,
            parentId: item.parent_id,
        }

        event.dataTransfer.setData(TREE_NODE_DRAG_TYPE, JSON.stringify(dragData))
        event.dataTransfer.effectAllowed = 'move'
        draggedNodeId.value = item.id
    }

    const handleDrag = (event: DragEvent) => {
        updateDragElementPosition(event)
    }

    const handleDragOver = (event: DragEvent, item: T) => {
        if (!event.dataTransfer || !item.id) {
            return
        }

        if (!event.dataTransfer.types.includes(TREE_NODE_DRAG_TYPE)) {
            return
        }

        if (draggedNodeId.value === item.id) {
            return
        }

        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }

    const handleDragEnter = (event: DragEvent, item: T) => {
        if (!event.dataTransfer || !item.id) {
            return
        }

        if (!event.dataTransfer.types.includes(TREE_NODE_DRAG_TYPE)) {
            return
        }

        if (draggedNodeId.value === null || draggedNodeId.value === item.id) {
            dropTargetNodeId.value = null
            return
        }

        const items = toValue(treeItems)
        const draggedNode = findNodeById(items, draggedNodeId.value)

        if (draggedNode && isDescendantOf(draggedNode, item.id)) {
            dropTargetNodeId.value = null
            return
        }

        dropTargetNodeId.value = item.id
    }

    const handleDragLeave = (event: DragEvent) => {
        const relatedTarget = event.relatedTarget

        if (relatedTarget instanceof Node) {
            const currentTarget = event.currentTarget
            if (currentTarget instanceof Node && currentTarget.contains(relatedTarget)) {
                return
            }
        }

        dropTargetNodeId.value = null
    }

    const handleDrop = async (event: DragEvent, item: T) => {
        event.preventDefault()
        dropTargetNodeId.value = null
        draggedNodeId.value = null
        removeDragElement()

        const dragData = parseTreeNodeDragData(event.dataTransfer)
        if (!dragData || !item.id) {
            return
        }

        if (!isValidDropTarget(dragData, item.id)) {
            return
        }

        await options.onMoveNode(dragData.nodeId, item.id)
    }

    const handleDragEnd = () => {
        draggedNodeId.value = null
        dropTargetNodeId.value = null
        removeDragElement()
    }

    return {
        draggedNodeId,
        dropTargetNodeId,
        handleDragStart,
        handleDrag,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    }
}
