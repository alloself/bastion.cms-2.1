<template>
    <VCard class="module-detail" rounded="0" flat>
        <VCardText class="module-detail__content pa-0">
            <BSmartForm
                class="module-detail__form"
                :loading="isSaving || isLoading"
                :fields="moduleFields"
                :initial-values="initialValues"
                v-model:form="form"
            />
        </VCardText>

        <VCardActions class="module-detail__footer d-flex flex-column pa-0">
            <VDivider role="separator" />
            <VSlideGroup
                class="module-detail__footer-actions"
                content-class="module-detail__footer-container"
                show-arrows
            >
                <VTooltip location="top" text="Назад" color="primary">
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            v-bind="activatorProps"
                            :disabled="isActionDisabled"
                            @click="handleBackClick"
                        >
                            <VIcon>mdi-arrow-left</VIcon>
                        </VBtn>
                    </template>
                    <span>Назад</span>
                </VTooltip>
                <VSpacer />
                <VTooltip location="top" text="Обновить" color="primary">
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            class="mr-2"
                            v-bind="activatorProps"
                            :disabled="isActionDisabled"
                            :loading="isRefreshing"
                            @click="handleRefreshClick"
                        >
                            <VIcon>mdi-refresh</VIcon>
                        </VBtn>
                    </template>
                    <span>Обновить</span>
                </VTooltip>

                <VTooltip
                    v-if="!isNewEntity"
                    location="top"
                    text="Удалить"
                    color="primary"
                >
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            color="error"
                            class="mr-2"
                            v-bind="activatorProps"
                            :disabled="isActionDisabled"
                            :loading="isDeleting"
                            @click="handleDeleteClick"
                        >
                            <VIcon>mdi-delete</VIcon>
                        </VBtn>
                    </template>
                    <span>Удалить</span>
                </VTooltip>

                <VTooltip
                    location="top"
                    :text="isNewEntity ? 'Создать' : 'Сохранить'"
                    color="primary"
                >
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            color="primary"
                            v-bind="activatorProps"
                            :disabled="isSaveDisabled"
                            :loading="isSaving"
                            @click="handleSubmit"
                        >
                            <VIcon>mdi-content-save</VIcon>
                        </VBtn>
                    </template>
                    <span>{{ isNewEntity ? "Создать" : "Сохранить" }}</span>
                </VTooltip>
            </VSlideGroup>
        </VCardActions>
    </VCard>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { capitalize, computed, ref, watch } from "vue";
import type { FormContext } from "vee-validate";
import type { IBaseEntity } from "@/admin/ts/shared/types";
import type { IModule } from "@admin/ts/shared/modules";
import { useNotificationsStore } from "@admin/ts/features/notifications";
import { useScreenStore, type TTabId } from "@admin/ts/features/screen";
import { createModuleDetailQuery } from "@admin/ts/shared/modules/queries";
import { toScreenRoute } from "@admin/ts/shared/helpers";
import { useFormSubmit } from "@admin/ts/shared/composables/useFormSubmit";
import { useModuleForm } from "@admin/ts/shared/modules/forms";
import BSmartForm from "@admin/ts/shared/components/BSmartForm.vue";

const { module, id, tabFullPath, screenId, tabId } = defineProps<{
    module: IModule<T>;
    id?: string;
    tabFullPath?: string;
    screenId?: string;
    tabId?: TTabId;
}>();

const notificationsStore = useNotificationsStore();
const screenStore = useScreenStore();

const detailQuery = createModuleDetailQuery<T>({
    module,
    entityId: id,
});

const isNewEntity = computed(() => detailQuery.isNewEntity.value);

const isLoading = computed(() => {
    if (isNewEntity.value) {
        return false;
    }
    return detailQuery.isLoading.value || detailQuery.isPending.value;
});

const hasLoadError = computed(() => {
    return (
        detailQuery.error.value !== null &&
        detailQuery.error.value !== undefined
    );
});

const isSaving = computed(() => {
    return detailQuery.isCreating.value || detailQuery.isUpdating.value;
});

const isDeleting = computed(() => detailQuery.isDeleting.value);

const isRefreshing = ref(false);

const isActionDisabled = computed(() => {
    return (
        isLoading.value ||
        isSaving.value ||
        isDeleting.value ||
        isRefreshing.value
    );
});

const isSaveDisabled = computed(() => {
    return (
        isActionDisabled.value ||
        hasLoadError.value ||
        form.value === undefined ||
        form.value === null
    );
});

const form = ref<FormContext<T, T>>();

const { fields: moduleFields, createInitialValues } = useModuleForm(module);

const initialValues = computed(() => {
    if (isNewEntity.value) {
        return createInitialValues.value ?? undefined;
    }
    return detailQuery.data.value ?? undefined;
});

watch(
    () => ({
        entity: detailQuery.data.value,
        screenId,
        tabId,
    }),
    (nextState) => {
        const entity = nextState.entity;
        if (entity === null || entity === undefined) {
            return;
        }

        const titleGetter = module.getDetailTabTitle;
        if (!titleGetter) {
            return;
        }

        const fullPath = nextState.fullPath;
        if (typeof fullPath !== "string" || fullPath.trim() === "") {
            return;
        }

        const nextTitle = titleGetter(entity);
        if (nextTitle.trim() === "") {
            return;
        }

        const nextScreenId = nextState.screenId;
        if (typeof nextScreenId !== "string" || nextScreenId.trim() === "") {
            return;
        }

        const nextTabId = nextState.tabId;
        if (typeof nextTabId !== "string" || nextTabId.trim() === "") {
            return;
        }

        screenStore.setTabTitle(nextScreenId, nextTabId, nextTitle);
    },
    { immediate: true }
);

const normalizeErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (error instanceof Error && error.message.trim() !== "") {
        return error.message;
    }
    if (typeof error === "string" && error.trim() !== "") {
        return error;
    }
    return fallbackMessage;
};

const handleBackClick = async () => {
    await toScreenRoute({ name: `${capitalize(module.key)}List` });
};

const handleRefreshClick = async () => {
    if (isRefreshing.value) {
        return;
    }

    isRefreshing.value = true;
    try {
        await detailQuery.refetch();
    } catch (error: unknown) {
        notificationsStore.pushNotification({
            content: normalizeErrorMessage(error, "Не удалось обновить данные"),
            color: "error",
        });
    } finally {
        isRefreshing.value = false;
    }
};

const saveEntity = async () => {
    if (!form.value) {
        return;
    }

    const payload = form.value.values;

    if (isNewEntity.value) {
        const createdEntity = await detailQuery.createAsync(payload);
        const createdId = createdEntity.id;
        if (typeof createdId === "string" && createdId.trim() !== "") {
            await toScreenRoute({
                name: `${capitalize(module.key)}Detail`,
                params: { id: createdId },
            });
        }
        return;
    }

    if (!id) {
        return;
    }

    await detailQuery.updateAsync({
        entityId: id,
        payload,
    });
};

const { handler: handleSubmit } = useFormSubmit(saveEntity, form);

const handleDeleteClick = async () => {
    if (!id) {
        return;
    }

    try {
        await detailQuery.deleteEntityAsync(id);
        await toScreenRoute({
            name: `${capitalize(module.key)}List`,
        });
    } catch (error: unknown) {
        notificationsStore.pushNotification({
            content: normalizeErrorMessage(error, "Не удалось удалить запись"),
            color: "error",
        });
    }
};
</script>

<style lang="scss" scoped>
.module-detail {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;

    &__content {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    &__footer {
        position: sticky;
        bottom: 0;
        z-index: 2;
        background-color: rgb(var(--v-theme-surface));
        align-items: stretch;

        :deep(.module-detail__footer-container) {
            align-items: center;
            padding: 0 4px;
        }

        :deep(.v-slide-group__content) {
            align-items: center;
        }
    }

    &__footer-actions {
        width: 100%;
    }

    &__empty-state {
        padding: 24px 16px;
    }

    &__form {
        flex: 1 1 auto;
        min-height: 0;
    }
}
</style>
