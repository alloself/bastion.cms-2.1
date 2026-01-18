<template>
    <BTableLikeFieldWrapper
        :label="label"
        label-icon="mdi-file-tree"
        :readonly="readonly"
        :has-errors="normalizedErrorMessages.length > 0"
        :error-messages="normalizedErrorMessages"
    >
        <div v-if="!treeItems.length" class="b-relation-tree__empty">Нет дочерних элементов</div>

        <VTreeview
            v-else
            v-model:opened="openedNodes"
            :items="treeItems"
            :item-title="itemTitle"
            :item-value="itemValue"
            :item-children="itemChildren"
            :load-children="handleLoadChildren"
            density="compact"
            open-on-click
            class="b-relation-tree__tree"
        >
            <template #prepend="{ item, isOpen }">
                <VProgressCircular
                    v-if="isNodeLoading(item)"
                    indeterminate
                    size="16"
                    width="2"
                    class="mr-1"
                />
                <VIcon v-else size="small">
                    {{ getNodeIcon(item, isOpen) }}
                </VIcon>
            </template>

            <template #append="{ item }">
                <VBtn
                    v-if="!readonly"
                    icon
                    variant="text"
                    size="x-small"
                    @click.stop="handleEditClick(item, $event)"
                >
                    <VIcon size="small">mdi-pencil</VIcon>
                </VBtn>
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
                        @click="handleCreateClick"
                    />
                </template>
            </VTooltip>
        </template>
    </BTableLikeFieldWrapper>
</template>

<script setup lang="ts" generic="T extends IBaseTreeEntity<T>">
import { get } from 'lodash'
import { capitalize, computed, reactive, ref, shallowRef, triggerRef, watch } from 'vue'

import { useScreenNavigation } from '@/ts/features/screen'
import { BTableLikeFieldWrapper } from '@/ts/shared/components'
import { useFetchRelationTreeChildren, useNormalizedErrors } from '@/ts/shared/composables'
import { isBaseTreeEntity } from '@/ts/shared/helpers'
import type { IBaseTreeEntity, IModule } from '@/ts/shared/types'

const {
    parentId,
    module,
    itemTitle = 'name',
    itemValue = 'id',
    itemChildren = 'children',
    readonly = false,
    label,
    errorMessages,
} = defineProps<{
    parentId: string
    module: IModule<T>
    itemTitle?: string
    itemValue?: string
    itemChildren?: string
    readonly?: boolean
    label?: string
    errorMessages?: string | string[]
}>()

const relations = computed(() => module.relations?.detail ?? [])

const value = defineModel<T[]>()

const { toScreenRoute } = useScreenNavigation()

const normalizedErrorMessages = useNormalizedErrors(errorMessages)

const { fetchChildren } = useFetchRelationTreeChildren()

const treeItems = shallowRef<T[]>([])
const openedNodes = ref<string[]>([])
const loadingNodes = reactive<Set<string>>(new Set())

const prepareNodesForLazyLoad = (nodes: T[]) => {
    return nodes.map((node) => {
        if (node.children && node.children.length) {
            node.children = prepareNodesForLazyLoad(node.children)
        } else if (node.has_children) {
            node.children = []
        } else {
            node.children = undefined
        }

        return node
    })
}

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

    const nodeId = item.id
    loadingNodes.add(nodeId)

    try {
        const children = await fetchChildren<T>(module.key, nodeId, relations.value)

        item.children = prepareNodesForLazyLoad(children)
    } catch (error) {
        item.children = []
    } finally {
        loadingNodes.delete(nodeId)
        triggerRef(treeItems)
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

watch(
    value,
    (newValue) => {
        if (newValue && Array.isArray(newValue) && newValue.length) {
            treeItems.value = prepareNodesForLazyLoad(newValue)
        } else {
            treeItems.value = []
        }
    },
    { immediate: true },
)
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
}
</style>
