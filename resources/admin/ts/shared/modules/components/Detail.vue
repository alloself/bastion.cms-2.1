<template>
    <VCard class="module-detail" rounded="0" flat>
        <VCardText class="module-detail__content pa-0">
            <BSmartForm
                class="module-detail__form"
                :loading="isSaving || isLoading"
                :fields="fields"
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
                <VBtn
                    prepend-icon="mdi-arrow-left"
                    size="small"
                    variant="flat"
                    :disabled="isActionDisabled"
                    @click="handleBackClick"
                >
                    Назад
                </VBtn>
                <VSpacer />
                <VBtn
                    prepend-icon="mdi-refresh"
                    size="small"
                    variant="flat"
                    class="mr-2"
                    :disabled="isActionDisabled"
                    :loading="isRefreshing"
                    @click="handleRefreshClick"
                >
                    Обновить
                </VBtn>
                <VBtn
                    v-if="!isNewEntity"
                    prepend-icon="mdi-delete"
                    size="small"
                    variant="flat"
                    color="error"
                    :disabled="isActionDisabled"
                    :loading="isDeleting"
                    @click="handleDeleteClick"
                >
                    Удалить
                </VBtn>
                <VBtn
                    prepend-icon="mdi-content-save"
                    size="small"
                    variant="flat"
                    color="primary"
                    :disabled="isSaveDisabled"
                    :loading="isSaving"
                    @click="handleSubmit"
                >
                    {{ isNewEntity ? "Создать" : "Сохранить" }}
                </VBtn>
            </VSlideGroup>
        </VCardActions>
    </VCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { capitalize } from "vue";
import type { FormContext } from "vee-validate";
import type { IBaseEntity, ISmartFormField } from "@admin/ts/types";
import type { IModule } from "@admin/ts/shared/modules";
import { createModuleDetailQuery } from "@admin/ts/shared/modules/queries";
import { toScreenRoute } from "@admin/ts/shared/helpers";
import { useFormSubmit } from "@admin/ts/shared/composables/useFormSubmit";
import BSmartForm from "@admin/ts/shared/components/BSmartForm.vue";

const props = defineProps<{
    module: IModule;
    id?: string | string[];
    tabFullPath: string;
}>();

const moduleValue = computed(() => props.module);

const entityId = computed<string | null>(() => {
    const rawId = props.id;
    if (typeof rawId === "string") {
        const trimmedValue = rawId.trim();
        return trimmedValue === "" ? null : trimmedValue;
    }

    if (Array.isArray(rawId) && rawId.length > 0) {
        const firstValue = rawId[0];
        if (typeof firstValue === "string") {
            const trimmedValue = firstValue.trim();
            return trimmedValue === "" ? null : trimmedValue;
        }
    }

    return null;
});

const detailQuery = createModuleDetailQuery<IBaseEntity>({
    module: moduleValue,
    entityId,
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

const form = ref<FormContext<IBaseEntity, IBaseEntity>>();

const fields = computed<ISmartFormField[]>(() => {
    return moduleValue.value.headers
        .filter((header) => header.key.trim() !== "")
        .map((header) => {
            return {
                component: "v-text-field",
                key: header.key,
                props: {
                    label: header.title,
                    name: header.key,
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            };
        });
});

const initialValues = computed(() => {
    return detailQuery.data.value ?? undefined;
});

const handleBackClick = async () => {
    await toScreenRoute({ name: `${capitalize(moduleValue.value.key)}List` });
};

const handleRefreshClick = async () => {
    if (isRefreshing.value) {
        return;
    }

    isRefreshing.value = true;
    try {
        await detailQuery.refetch();
    } catch (error: unknown) {
         // TODO: show notify
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
                name: `${capitalize(moduleValue.value.key)}Detail`,
                params: { id: createdId },
            });
        }
        return;
    }

    const currentEntityId = entityId.value;
    if (!currentEntityId) {
        return;
    }

    await detailQuery.updateAsync({
        entityId: currentEntityId,
        payload,
    });
};

const { handler: handleSubmit } = useFormSubmit(saveEntity, form);

const handleDeleteClick = async () => {
    const currentEntityId = entityId.value;
    if (!currentEntityId) {
        return;
    }

    try {
        await detailQuery.deleteEntityAsync(currentEntityId);
        await toScreenRoute({
            name: `${capitalize(moduleValue.value.key)}List`,
        });
    } catch (error: unknown) {
        // TODO: show notify
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
