<template>
    <VCard class="module-detail" rounded="0" flat density="compact">
        <VCardText class="module-detail__content pa-0">
            <BSmartForm
                class="module-detail__form"
                :loading="isLoading"
                :fields="fields"
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
                <VTooltip location="top" text="Назад" color="primary">
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
                <VTooltip location="top" text="Обновить" color="primary">
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            class="mr-2"
                            v-bind="activatorProps"
                            :disabled="isLoading"
                            :loading="isLoading"
                            @click="handleRefreshClick"
                        >
                            <VIcon>mdi-refresh</VIcon>
                        </VBtn>
                    </template>
                    <span>Обновить</span>
                </VTooltip>

                <VTooltip
                    v-if="id"
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
                            :disabled="isLoading"
                            :loading="isLoading"
                            @click="handleDeleteClick"
                        >
                            <VIcon>mdi-delete</VIcon>
                        </VBtn>
                    </template>
                    <span>Удалить</span>
                </VTooltip>

                <VTooltip
                    location="top"
                    :text="id ? 'Сохранить' : 'Создать'"
                    color="primary"
                >
                    <template #activator="{ props: activatorProps }">
                        <VBtn
                            icon
                            size="x-small"
                            variant="flat"
                            color="primary"
                            v-bind="activatorProps"
                            :disabled="isLoading"
                            :loading="isLoading"
                            @click="handleSaveClick"
                        >
                            <VIcon>mdi-content-save</VIcon>
                        </VBtn>
                    </template>
                    <span>{{ id ? "Сохранить" : "Создать" }}</span>
                </VTooltip>
            </VSlideGroup>
        </VCardActions>
    </VCard>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { ITab } from "@/ts/features/screen";
import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "../../types";
import { BSmartForm } from "../../components";
import type { FormContext } from "vee-validate";
import { capitalize, computed, onActivated, ref, watch } from "vue";
import { useModuleDetailQuery } from "../queries/detail";
import { toScreenRoute } from "../../helpers";

const { module, id, tab } = defineProps<{
    module: IModule<T>;
    id?: TUUID;
    tab: ITab;
}>();

const handleBackClick = async () => {
    await toScreenRoute({ name: `${capitalize(module.key)}List` });
};

const form = ref<FormContext<T, T>>();

const { detailQuery, createMutation, updateMutation, deleteMutation } =
    useModuleDetailQuery(module, id);

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

const fields = computed(() => moduleFormContext.value.fields.value);

const initialValues = computed(() => {
    return moduleFormContext.value.createInitialValues();
});

const handleRefreshClick = async () => {};

const handleDeleteClick = async () => {};

const handleSaveClick = async () => {};

watch(
    () => detailQuery.data.value,
    (newData) => {
        tab.title = module.getDetailTabTitle(newData);
    }
);

onActivated(() => {
    tab.title = module.getDetailTabTitle(detailQuery.data.value);
});
</script>

<style lang="scss" scoped>
.module-detail {
    display: flex;
    flex-direction: column;
    padding: 8px 8px 0px 8px;
    height: calc(100svh - 96px);
    &__footer {
        position: sticky;
        bottom: 0;
        border-top: 1px solid
            rgba(var(--v-border-color), var(--v-border-opacity));
        margin: 0 -8px;
        padding: 0 8px;

        &-actions {
            width: 100%;
        }
    }

    &__content {
        flex: 1 1 auto;
    }
}
</style>
