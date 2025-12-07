<template>
    <div class="module-list">
        <div class="module-list__toolbar">
            <VTextField
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Поиск"
                single-line
                hide-details
                clearable
                density="compact"
                class="module-list__search"
                @update:model-value="handleSearchDebounced"
            />
            <VSpacer />
            <VBtn
                v-if="selectedItems.length > 0"
                color="error"
                variant="outlined"
                :loading="isDeletingBatch"
                class="mr-2"
                @click="handleOpenBatchDeleteDialog"
            >
                <VIcon start>mdi-delete</VIcon>
                Удалить ({{ selectedItems.length }})
            </VBtn>
            <VBtn color="primary" @click="handleCreateClick">
                <VIcon start>mdi-plus</VIcon>
                Создать
            </VBtn>
        </div>

        <VDataTableServer
            v-model="selectedItems"
            :headers="tableHeaders"
            :items="items"
            :items-length="totalItems"
            :loading="isLoading"
            :page="tableOptions.page"
            :items-per-page="tableOptions.itemsPerPage"
            :sort-by="tableOptions.sortBy"
            show-select
            item-value="id"
            class="module-list__table"
            @update:options="handleOptionsUpdate"
            @click:row="handleRowClick"
        >
            <template #item.actions="{ item }">
                <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="handleOpenDeleteDialog(item.id)"
                >
                    <VIcon>mdi-delete</VIcon>
                </VBtn>
            </template>
        </VDataTableServer>

        <VDialog v-model="deleteDialog.isOpen" max-width="400">
            <VCard>
                <VCardTitle>Подтверждение удаления</VCardTitle>
                <VCardText>
                    <template v-if="deleteDialog.isBatch">
                        Вы уверены, что хотите удалить
                        {{ deleteDialog.entityIds.length }} элементов?
                    </template>
                    <template v-else>
                        Вы уверены, что хотите удалить этот элемент?
                    </template>
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn variant="text" @click="handleCloseDeleteDialog">
                        Отмена
                    </VBtn>
                    <VBtn
                        color="error"
                        variant="flat"
                        :loading="isDeleting || isDeletingBatch"
                        @click="handleConfirmDelete"
                    >
                        Удалить
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { computed, reactive, ref, capitalize } from "vue";
import { useDebounceFn } from "@vueuse/core";
import type {
    IBaseEntity,
    IDeleteDialogState,
    ITableHeader,
    IVuetifyTableOptions,
} from "@admin/ts/types";
import type { IModule } from "..";
import { createModuleListQuery } from "../queries";
import { toScreenRoute } from "@admin/ts/shared/helpers";

const props = defineProps<{
    module: IModule;
}>();

const searchQuery = ref("");

const tableOptions = reactive<IVuetifyTableOptions>({
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    groupBy: [],
});

const queryParams = computed(() => ({
    page: tableOptions.page,
    per_page: tableOptions.itemsPerPage,
    sortBy: tableOptions.sortBy,
    search: searchQuery.value,
}));

const {
    data,
    isLoading,
    deleteEntity,
    deleteEntities,
    isDeleting,
    isDeletingBatch,
} = createModuleListQuery<T>({
    module: () => props.module,
    queryParams,
});

const selectedItems = ref<string[]>([]);

const items = computed(() => data.value?.data ?? []);
const totalItems = computed(() => data.value?.meta.total ?? 0);

const tableHeaders = computed<ITableHeader[]>(() => [
    ...props.module.headers,
    {
        title: "",
        key: "actions",
        sortable: false,
        width: 80,
        align: "center",
    },
]);

const deleteDialog = reactive<IDeleteDialogState>({
    isOpen: false,
    entityId: null,
    entityIds: [],
    isBatch: false,
});

const handleOptionsUpdate = (options: IVuetifyTableOptions) => {
    tableOptions.page = options.page;
    tableOptions.itemsPerPage = options.itemsPerPage;
    tableOptions.sortBy = options.sortBy;
    tableOptions.groupBy = options.groupBy;
};

const handleSearchDebounced = useDebounceFn(() => {
    tableOptions.page = 1;
}, 300);

const handleRowClick = async (event: Event, { item }: { item: T }) => {
    if (!item.id) {
        return;
    }
    await toScreenRoute(
        {
            name: `${capitalize(props.module.key)}Detail`,
            params: { id: item.id },
        },
        event
    );
};

const handleCreateClick = async (event: MouseEvent) => {
    await toScreenRoute(
        {
            name: `${capitalize(props.module.key)}Create`,
        },
        event
    );
};

const handleOpenDeleteDialog = (entityId: string | undefined) => {
    if (!entityId) {
        return;
    }
    deleteDialog.isOpen = true;
    deleteDialog.entityId = entityId;
    deleteDialog.isBatch = false;
};

const handleOpenBatchDeleteDialog = () => {
    deleteDialog.isOpen = true;
    deleteDialog.entityIds = [...selectedItems.value];
    deleteDialog.isBatch = true;
};

const handleCloseDeleteDialog = () => {
    deleteDialog.isOpen = false;
    deleteDialog.entityId = null;
    deleteDialog.entityIds = [];
    deleteDialog.isBatch = false;
};

const handleConfirmDelete = async () => {
    if (deleteDialog.isBatch) {
        await deleteEntities(deleteDialog.entityIds);
        selectedItems.value = [];
    } else if (deleteDialog.entityId) {
        await deleteEntity(deleteDialog.entityId);
    }
    handleCloseDeleteDialog();
};
</script>

<style lang="scss" scoped>
.module-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;

    &__toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
    }

    &__search {
        max-width: 300px;
    }

    &__table {
        flex: 1;
    }
}
</style>
