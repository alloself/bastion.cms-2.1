<template>
    <BTableLikeFieldWrapper
        :label="label"
        label-icon="mdi-file-tree"
        :readonly="readonly"
        :has-errors="normalizedErrorMessages.length > 0"
        :error-messages="normalizedErrorMessages"
    >
        <template #header-append>
            <VTextField
                v-model="searchQuery"
                :disabled="disabled"
                density="compact"
                variant="solo"
                placeholder="Поиск..."
                append-inner-icon="mdi-magnify"
                hide-details
                clearable
                single-line
                class="b-relation-tree__search"
            />
        </template>

        <div v-if="!value.length" class="b-relation-tree__empty">Нет дочерних элементов</div>

        <VTreeview
            v-else
            v-model:opened="openedNodes"
            :items="value"
            :search="searchQuery"
            separate-roots
            :item-title="itemTitle"
            indent-lines
            :item-value="itemValue"
            :item-children="itemChildren"
            :load-children="handleLoadChildren"
            :disabled="disabled"
            :hideActions="disabled"
            open-on-click
            density="compact"
            class="b-relation-tree__tree"
        >
            <template #prepend="{ item, isOpen }">
                <VIcon
                    v-if="isDragEnabled"
                    icon="mdi-drag"
                    size="small"
                    draggable="true"
                    class="b-relation-tree__drag-handle"
                    @dragstart.stop="handleDragStart($event, item)"
                    @drag="handleDrag"
                    @dragend="handleDragEnd"
                />
                <VProgressCircular
                    v-if="isNodeLoading(item)"
                    indeterminate
                    size="16"
                    width="2"
                    class="mr-1"
                />
                <VIcon v-else size="small" :icon="getNodeIcon(item, isOpen)" />
            </template>

            <template #title="{ item }">
                <div
                    class="b-relation-tree__drop-zone"
                    :class="{
                        'b-relation-tree__drop-zone--active':
                            dropTargetNodeId === item.id && draggedNodeId !== item.id,
                        'b-relation-tree__drop-zone--dragging': draggedNodeId === item.id,
                    }"
                    @dragover="handleDragOver($event, item)"
                    @dragenter="handleDragEnter($event, item)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, item)"
                >
                    {{ get(item, itemTitle ?? 'title') ?? '' }}
                </div>
            </template>

            <template #append="{ item }">
                <VTooltip v-if="!readonly" location="top" text="Создать дочерний элемент">
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon="mdi-file-tree"
                            variant="text"
                            size="x-small"
                            :disabled="disabled"
                            v-bind="activatorProps"
                            @click.stop="handleCreateChildClick(item, $event)"
                        />
                    </template>
                </VTooltip>
                <VBtn
                    v-if="!readonly"
                    icon="mdi-pencil"
                    variant="text"
                    size="x-small"
                    :disabled="disabled"
                    @click.stop="handleEditClick(item, $event)"
                />
            </template>
        </VTreeview>

        <template #actions>
            <VTooltip v-if="!readonly" location="top" text="Создать дочерний элемент">
                <template #activator="{ props: activatorProps }">
                    <VBtn
                        icon="mdi-plus"
                        size="x-small"
                        variant="flat"
                        color="primary"
                        v-bind="activatorProps"
                        :disabled="disabled"
                        @click="handleCreateClick($event)"
                    />
                </template>
            </VTooltip>
        </template>
    </BTableLikeFieldWrapper>
</template>

<script setup lang="ts" generic="T extends IBaseTreeEntity<T>">
import { get } from 'lodash'
import { capitalize, computed, reactive, ref } from 'vue'

import { useScreenNavigation } from '@/ts/features/screen'
import { BTableLikeFieldWrapper } from '@/ts/shared/components'
import {
    useNormalizedErrors,
    useRelationTreeQuery,
    useTreeDragDrop,
    useTreeNodeMove,
} from '@/ts/shared/composables'
import { isBaseTreeEntity, traverseTree } from '@/ts/shared/helpers'
import type { IBaseTreeEntity, IModule } from '@/ts/shared/types'

const {
    parentId,
    module,
    itemTitle,
    itemValue = 'id',
    itemChildren,
    readonly,
    disabled,
    label,
    errorMessages,
} = defineProps<{
    parentId: string
    module: IModule<T>
    itemTitle?: string
    itemValue?: string
    itemChildren?: string
    readonly?: boolean
    disabled?: boolean
    label?: string
    errorMessages?: string | string[]
}>()

const relations = computed(() => module.relations?.detail ?? [])

const value = defineModel<T[]>({ default: () => [] })

const { toScreenRoute } = useScreenNavigation()

const normalizedErrorMessages = useNormalizedErrors(errorMessages)

const currentParentId = ref<string>('')

const treeQuery = useRelationTreeQuery<T>(module.key, currentParentId, relations)
const openedNodes = ref<string[]>([])
const loadingNodes = reactive<Set<string>>(new Set())
const searchQuery = ref('')

const isDragEnabled = computed(() => !readonly && !disabled)

const { moveMutation } = useTreeNodeMove<T>(module.key)

const extractNodeFromTree = (nodeId: string): T | undefined => {
    let extracted: T | undefined

    traverseTree(value.value, (item) => {
        if (!item.children) {
            return
        }

        const childIndex = item.children.findIndex((child) => child.id === nodeId)
        if (childIndex === -1) {
            return
        }

        extracted = item.children[childIndex]
        item.children.splice(childIndex, 1)

        if (!item.children.length) {
            item.has_children = false
            item.children = undefined
        }
    })

    return extracted
}

const insertNodeIntoParent = (node: T, newParentId: string) => {
    node.parent_id = newParentId
    node.children = node.has_children ? [] : undefined

    traverseTree(value.value, (item) => {
        if (item.id === newParentId) {
            if (!item.children) {
                item.children = []
            }
            item.children.push(node)
            item.has_children = true
        }
    })
}

const moveNodeInTree = (nodeId: string, newParentId: string) => {
    const node = extractNodeFromTree(nodeId)

    if (node) {
        insertNodeIntoParent(node, newParentId)
    }
}

const handleMoveNode = async (nodeId: string, newParentId: string) => {
    let nodeToMove: T | undefined

    traverseTree(value.value, (item) => {
        if (item.id === nodeId) {
            nodeToMove = item
        }
    })

    if (!nodeToMove) {
        return
    }

    await moveMutation.mutateAsync({
        nodeId,
        nodeData: nodeToMove,
        parentId: newParentId,
    })
    moveNodeInTree(nodeId, newParentId)
}

const {
    draggedNodeId,
    dropTargetNodeId,
    handleDragStart,
    handleDrag,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
} = useTreeDragDrop<T>(value, { onMoveNode: handleMoveNode })

const isNodeLoading = (item: T) => {
    return item.id ? loadingNodes.has(item.id) : false
}

const getNodeIcon = (item: T, isOpen: boolean) => {
    if (item.has_children) {
        return isOpen ? 'mdi-file-document-multiple-outline' : 'mdi-file-document-multiple'
    }

    return 'mdi-file-document-outline'
}

const handleLoadChildren = async (item: unknown) => {
    if (!isBaseTreeEntity(item) || !item.id) {
        return
    }

    loadingNodes.add(item.id)

    try {
        currentParentId.value = item.id
        await treeQuery.refetch()
        const children = treeQuery.data.value ?? []

        item.children = children
    } catch (error) {
        item.children = []
    } finally {
        loadingNodes.delete(item.id)
    }
}

const handleEditClick = async (item: T, event: MouseEvent) => {
    const nodeId = get(item, itemValue)
    if (!nodeId) {
        return
    }

    await toScreenRoute(
        {
            name: `${capitalize(module.key)}Detail`,
            params: { id: nodeId },
        },
        event,
    )
}

const handleCreateClick = async (event: MouseEvent) => {
    await toScreenRoute(
        {
            name: `${capitalize(module.key)}Create`,
            query: { parent_id: parentId },
        },
        event,
    )
}

const handleCreateChildClick = async (item: T, event: MouseEvent) => {
    await toScreenRoute(
        {
            name: `${capitalize(module.key)}Create`,
            query: { parent_id: item.id },
        },
        event,
    )
}
</script>

<style scoped lang="scss">
.b-relation-tree {
    &__tree {
        padding: 0px;
    }

    &__loading {
        display: flex;
        justify-content: center;
        padding: 24px;
    }

    &__empty {
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
    }

    &__search {
        :deep(.v-field) {
            box-shadow: none;
        }
    }

    &__drag-handle {
        display: inline-flex;
        align-items: center;
        cursor: grab;
        margin-right: 4px;
        opacity: 0.4;
        transition: opacity 0.15s;

        &:hover {
            opacity: 1;
        }

        &:active {
            cursor: grabbing;
        }
    }

    &__drop-zone {
        flex: 1;
        padding: 2px 4px;
        border-radius: 4px;
        border: 2px solid transparent;
        transition:
            border-color 0.15s,
            background-color 0.15s;

        &--active {
            border-color: rgb(var(--v-theme-primary));
            background-color: rgba(var(--v-theme-primary), 0.1);
        }

        &--dragging {
            opacity: 0.4;
        }
    }
}
</style>
