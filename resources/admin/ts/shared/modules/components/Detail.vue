<template>
    <VCard class="module-detail" rounded="0" flat>
        <VCardText class="module-detail__content pa-0">
            <BSmartForm
                class="module-detail__form"
                :loading="isLoading"
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
import type { ITab } from "@/ts/features/screen";
import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "../../types";
import { BSmartForm } from "../../components";
import type { FormContext } from "vee-validate";
import { ref } from "vue";

const { module, id, tab } = defineProps<{
    module: IModule<T>;
    id?: TUUID;
    tab: ITab;
}>();

const form = ref<FormContext<T, T>>();
</script>
