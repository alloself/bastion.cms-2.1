<template>
    <VCard class="module-detail" rounded="0" flat density="compact">
        <VDialog v-model="isDeleteDialogVisible" max-width="400" persistent>
            <VCard>
                <VCardTitle class="text-h6">Подтверждение удаления</VCardTitle>
                <VCardText>
                    Вы уверены, что хотите удалить эту запись? Это действие
                    нельзя отменить.
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn
                        variant="text"
                        :disabled="isLoading"
                        @click="handleCancelDelete"
                    >
                        Отмена
                    </VBtn>
                    <VBtn
                        color="error"
                        variant="flat"
                        :loading="isLoading"
                        @click="handleConfirmDelete"
                    >
                        Удалить
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>

        <VCardText class="module-detail__content">
            <BSmartForm
                class="module-detail__form"
                :loading="isLoading"
                :fields="fields"
                :layout="layout"
                :initial-values="initialValues"
                v-model:form="form"
            />
        </VCardText>

        <VCardActions class="module-detail__footer">
            <VSlideGroup
                class="module-detail__footer-actions"
                content-class="module-detail__footer-container"
                show-arrows
            >
                <VTooltip
                    v-if="canGoBack"
                    location="top"
                    text="Назад"
                    color="primary"
                >
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            v-bind="activatorProps"
                            :disabled="isLoading"
                            @click="handleBackClick"
                        >
                            <VIcon>mdi-arrow-left</VIcon>
                        </VBtn>
                    </template>
                    <span>Назад</span>
                </VTooltip>
                <VSpacer />

                <template v-for="action in actions" :key="action.key">
                    <VTooltip
                        v-if="action.isVisible"
                        location="top"
                        :text="action.tooltipText"
                        color="primary"
                    >
                        <template #activator="{ props: activatorProps }">
                            <VBtn
                                icon
                                size="x-small"
                                variant="flat"
                                :color="action.color"
                                :class="action.buttonClass"
                                v-bind="activatorProps"
                                :disabled="action.isDisabled"
                                :loading="action.isLoading"
                                @click="action.handleClick"
                            >
                                <VIcon :icon="action.icon" />
                            </VBtn>
                        </template>
                        <span>{{ action.label }}</span>
                    </VTooltip>
                </template>
            </VSlideGroup>
        </VCardActions>
    </VCard>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import { type ITab, useScreenNavigation } from "@/ts/features/screen";
import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "@/ts/shared/types";
import { BSmartForm } from "@/ts/shared/components";
import type { FormContext } from "vee-validate";
import { capitalize, computed, onActivated, ref, watch } from "vue";
import { isAxiosError } from "axios";
import { useRouter } from "vue-router";
import { useModuleDetailQuery } from "../queries/detail";
import { useGlobalHotkey } from "@/ts/shared/composables";
import type { PartialDeep } from "type-fest";

type TAction = {
    key: string;
    isVisible: boolean;
    tooltipText: string;
    label: string;
    icon: string;
    color?: string;
    buttonClass: string;
    isDisabled: boolean;
    isLoading: boolean;
    handleClick: () => Promise<void>;
};

const { module, id, tab } = defineProps<{
    module: IModule<T>;
    id?: TUUID;
    tab: ITab;
}>();

const router = useRouter();
const { toScreenRoute } = useScreenNavigation();

const canGoBack = computed(() => {
    const historyState = window.history.state;
    return Boolean(historyState?.back);
});

const handleBackClick = async () => {
    if (canGoBack.value) {
        router.back();
        return;
    }
    await toScreenRoute({ name: `${capitalize(module.key)}List` });
};

const form = ref<FormContext<T, T>>();
const isDeleteDialogVisible = ref(false);

const { detailQuery, createMutation, updateMutation, deleteMutation } =
    useModuleDetailQuery(module, () => id);

const moduleFormContext = computed(() => {
    const data = detailQuery.data.value;
    if (!data) {
        return module.createForm();
    }
    return module.createForm(data);
});

const isLoading = computed(
    () =>
        detailQuery.asyncStatus.value === "loading" ||
        createMutation.asyncStatus.value === "loading" ||
        updateMutation.asyncStatus.value === "loading" ||
        deleteMutation.asyncStatus.value === "loading"
);

const actions = computed<Array<TAction>>(() => {
    const isDisabled = isLoading.value;

    const refreshAction: TAction = {
        key: "refresh",
        isVisible: false,
        tooltipText: "",
        label: "",
        icon: "mdi-refresh",
        buttonClass: "mr-2",
        isDisabled,
        isLoading: isLoading.value,
        handleClick: handleRefreshClick,
    };

    const deleteAction: TAction = {
        key: "delete",
        isVisible: !!id,
        tooltipText: "Удалить",
        label: "Удалить",
        icon: "mdi-delete",
        color: "error",
        buttonClass: "mr-2",
        isDisabled,
        isLoading: isLoading.value,
        handleClick: handleDeleteClick,
    };

    const saveAction: TAction = {
        key: "save",
        isVisible: true,
        tooltipText: id ? "Сохранить" : "Создать",
        label: id ? "Сохранить" : "Создать",
        icon: "mdi-content-save",
        color: "primary",
        buttonClass: "",
        isDisabled,
        isLoading: isLoading.value,
        handleClick: id ? handleSaveClick : handleCreateClick,
    };

    return [refreshAction, deleteAction, saveAction];
});

const fields = computed(() => moduleFormContext.value.fields.value);
const layout = computed(() => moduleFormContext.value.layout);

const initialValues = computed(() => {
    if (id && detailQuery.data.value) {
        return detailQuery.data.value as PartialDeep<T>;
    }
    return moduleFormContext.value.createInitialValues();
});

const handleRefreshClick = async () => {
    if (id) {
        await detailQuery.refetch();
        return;
    }

    form.value?.resetForm();
};

const handleDeleteClick = async () => {
    if (!id) {
        return;
    }
    isDeleteDialogVisible.value = true;
};

const handleCancelDelete = () => {
    isDeleteDialogVisible.value = false;
};

const handleConfirmDelete = async () => {
    if (!id) {
        return;
    }

    await deleteMutation.mutateAsync(id);
    isDeleteDialogVisible.value = false;
    await toScreenRoute({ name: `${capitalize(module.key)}List` });
};

const handleSaveClick = async () => {
    if (!id) {
        return;
    }

    const formContext = form.value;
    if (!formContext) {
        return;
    }

    const validationResult = await formContext.validate();
    if (!validationResult.valid) {
        return;
    }

    try {
        await updateMutation.mutateAsync({
            id,
            payload: formContext.values,
        });
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            const formErrors = error.response?.data?.errors;
            if (formErrors) {
                formContext.setErrors(formErrors);
            }
        }
    }
};

const handleCreateClick = async () => {
    const formContext = form.value;
    if (!formContext) {
        return;
    }

    const validationResult = await formContext.validate();
    if (!validationResult.valid) {
        return;
    }

    try {
        const createdEntity = await createMutation.mutateAsync(formContext.values);
        if (!createdEntity.id) {
            return;
        }

        await toScreenRoute({
            name: `${capitalize(module.key)}Detail`,
            params: { id: createdEntity.id },
        });
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            const formErrors = error.response?.data?.errors;
            if (formErrors) {
                formContext.setErrors(formErrors);
            }
        }
    }
};

watch(
    () => detailQuery.data.value,
    (newData) => {
        tab.title = module.getDetailTabTitle(newData);
    }
);

useGlobalHotkey(
    "KeyS",
    () => {
        if (id) {
            handleSaveClick();
        } else {
            handleCreateClick();
        }
    },
    { ctrl: true }
);

onActivated(() => {
    tab.title = module.getDetailTabTitle(detailQuery.data.value);
});
</script>

<style lang="scss" scoped>
.module-detail {
    display: flex;
    flex-direction: column;
    height: calc(100svh - 96px);

    &__content {
        padding: 8px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    &__footer {
        position: sticky;
        bottom: 0;
        height: 57px;
        border-top: 1px solid
            rgba(var(--v-border-color), var(--v-border-opacity));
        margin: 0 -8px;
        padding: 0 16px;
        background: rgb(var(--v-theme-surface));
        z-index: 1;

        &-actions {
            width: 100%;
        }
    }

    &__content {
        flex: 1 1 auto;
        min-height: 0;
    }

    &__form {
        flex: 1 1 auto;
        min-height: 0;
    }
}
</style>
