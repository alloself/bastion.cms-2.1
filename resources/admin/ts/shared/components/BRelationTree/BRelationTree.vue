<template>
    <BTableLikeFieldWrapper :label="label" label-icon="mdi-file-tree" :readonly="readonly"
        :has-errors="normalizedErrorMessages.length > 0" :error-messages="normalizedErrorMessages">
        <div v-if="!hasItems" class="b-relation-tree__empty">
            Нет дочерних элементов
        </div>

        <VTreeview v-else v-model:opened="openedNodes" :items="treeItems" :item-title="itemTitle"
            :item-value="itemValue" :item-children="itemChildren" :load-children="handleLoadChildren" density="compact"
            open-on-click class="b-relation-tree__tree">
            <template #prepend="{ item, isOpen }">
                <VProgressCircular v-if="isNodeLoading(item)" indeterminate size="16" width="2" class="mr-1" />
                <VIcon v-else size="small">
                    {{ getNodeIcon(item, isOpen) }}
                </VIcon>
            </template>

            <template #append="{ item }">
                <VBtn v-if="!readonly" icon variant="text" size="x-small" @click.stop="handleEditClick(item, $event)">
                    <VIcon size="small">mdi-pencil</VIcon>
                </VBtn>
            </template>
        </VTreeview>

        <template #actions>
            <VTooltip v-if="!readonly" location="top" text="Создать дочерний элемент">
                <template #activator="{ props: activatorProps }">
                    <VBtn icon="mdi-plus" size="x-small" variant="flat" color="primary" v-bind="activatorProps"
                        @click="handleCreateClick" />

                </template>
            </VTooltip>
        </template>
    </BTableLikeFieldWrapper>
</template>

<script setup lang="ts">
import { computed, ref, watch, capitalize } from "vue";
import { get, isObject } from "lodash";
import type { TBRelationTreeProps } from "./BRelationTree.types";
import type { IBaseTreeEntity } from "@/ts/shared/types";
import {
    useNormalizedErrors,
    useRelationTreeChildren,
    fetchRelationTreeChildren,
} from "@/ts/shared/composables";
import { useScreenNavigation } from "@/ts/features/screen";
import { BTableLikeFieldWrapper } from "@/ts/shared/components";

const {
    parentId,
    endpoint,
    itemTitle = 'name',
    itemValue = 'id',
    itemChildren = 'children',
    relations = [],
    readonly = false,
    label,
    errorMessages,

} = defineProps<TBRelationTreeProps>();

const value = defineModel<IBaseTreeEntity[]>();

const { toScreenRoute } = useScreenNavigation();

const normalizedErrorMessages = useNormalizedErrors(() => errorMessages);

const { data } =
    useRelationTreeChildren<IBaseTreeEntity>(
        endpoint,
        parentId,
        relations
    );

const treeItems = ref<IBaseTreeEntity[]>([]);
const openedNodes = ref<string[]>([]);
const loadingNodes = ref<Set<string>>(new Set());

const hasItems = computed(() => treeItems.value.length);

const prepareNodesForLazyLoad = (nodes: IBaseTreeEntity[]): IBaseTreeEntity[] => {
    return nodes.map((node) => {
        if (node.children && node.children.length) {
            node.children = prepareNodesForLazyLoad(node.children);
        } else if (node.has_children) {
            node.children = [];
        }

        return node;
    });
};

const isBaseTreeEntity = (item: unknown): item is IBaseTreeEntity => {
    return isObject(item) &&
        "id" in item &&
        "has_children" in item;
};

const isNodeLoading = (item: IBaseTreeEntity): boolean => {
    return item.id ? loadingNodes.value.has(item.id) : false;
};

const getNodeIcon = (item: IBaseTreeEntity, isOpen: boolean): string => {
    if (item.has_children) {
        return isOpen ? "mdi-file-document-multiple-outline" : "mdi-file-document-multiple";
    }

    return "mdi-file-document-outline";
};

const handleLoadChildren = async (item: unknown): Promise<void> => {
    if (!isBaseTreeEntity(item) || !item.id) {
        return;
    }

    const nodeId = item.id;
    loadingNodes.value.add(nodeId);

    try {
        const children = await fetchRelationTreeChildren<IBaseTreeEntity>(
            endpoint,
            nodeId,
            relations
        );

        item.children = prepareNodesForLazyLoad(children);
    } catch (error) {
        item.children = [];
    } finally {
        loadingNodes.value.delete(nodeId);
    }
};

const handleEditClick = async (item: IBaseTreeEntity, event: MouseEvent) => {
    const nodeId = get(item, itemValue);
    if (!nodeId) {
        return;
    }

    await toScreenRoute(
        {
            name: `${capitalize(endpoint)}Detail`,
            params: { id: nodeId },
        },
        event
    );
};

const handleCreateClick = async (event: MouseEvent) => {
    await toScreenRoute(
        {
            name: `${capitalize(endpoint)}Create`,
        },
        event
    );
};

watch(
    value,
    (newValue) => {
        if (newValue && Array.isArray(newValue) && newValue.length) {
            treeItems.value = prepareNodesForLazyLoad(newValue);
        }
    },
    { immediate: true }
);

watch(data, (newData) => {
    if (newData && newData.length) {
        treeItems.value = prepareNodesForLazyLoad(newData);
    } else if (!value.value || !value.value.length) {
        treeItems.value = [];
    }
});
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
