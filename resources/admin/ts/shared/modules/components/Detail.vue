<template>
    <div class="module-detail">
        <div class="module-detail__toolbar">
            <VBtn variant="text" @click="handleBack">
                <VIcon start>mdi-arrow-left</VIcon>
                Назад
            </VBtn>
            <VSpacer />
            <VBtn
                v-if="!isNewEntity && id"
                color="error"
                variant="outlined"
                class="mr-2"
                @click="handleOpenDeleteDialog"
            >
                <VIcon start>mdi-delete</VIcon>
                Удалить
            </VBtn>
            <VBtn
                color="primary"
                :loading="isSaving"
                @click="handleSave"
            >
                <VIcon start>mdi-content-save</VIcon>
                {{ isNewEntity ? "Создать" : "Сохранить" }}
            </VBtn>
        </div>

        <VCard class="module-detail__card">
            <VCardTitle>
                {{ isNewEntity ? `${module.title}: Создание` : `${module.title} #${id}` }}
            </VCardTitle>
            <VCardText class="pa-0">
                <div v-if="isPending && !isNewEntity" class="module-detail__loading">
                    <VProgressCircular indeterminate />
                </div>
                <BSmartForm
                    v-else
                    :fields="formFields"
                    :initial-values="initialValues"
                    :loading="isSaving"
                    v-model:form="form"
                >
                    <template
                        v-for="(_, slotName) in $slots"
                        :key="slotName"
                        #[slotName]="slotProps"
                    >
                        <slot :name="slotName" v-bind="slotProps" />
                    </template>
                </BSmartForm>
            </VCardText>
        </VCard>

        <VDialog v-model="isDeleteDialogOpen" max-width="400">
            <VCard>
                <VCardTitle>Подтверждение удаления</VCardTitle>
                <VCardText>
                    Вы уверены, что хотите удалить этот элемент?
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn variant="text" @click="isDeleteDialogOpen = false">
                        Отмена
                    </VBtn>
                    <VBtn
                        color="error"
                        variant="flat"
                        :loading="isDeleting"
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
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { capitalize } from "vue";
import type { FormContext } from "vee-validate";
import type { IBaseEntity, ISmartFormField } from "@admin/ts/types";
import type { IModule } from "..";
import { createModuleDetailQuery } from "../queries";
import { useFormSubmit } from "@admin/ts/shared/composables/useFormSubmit";
import BSmartForm from "@admin/ts/shared/components/BSmartForm.vue";
import { toScreenRoute } from "@admin/ts/shared/helpers";

const props = defineProps<{
    module: IModule;
    id?: string;
    fields?: ISmartFormField[];
}>();

const emit = defineEmits<{
    created: [entity: T];
    updated: [entity: T];
    deleted: [entityId: string];
}>();

const router = useRouter();

const form = ref<FormContext<Partial<T>, Partial<T>>>();
const isDeleteDialogOpen = ref(false);

const {
    data,
    isPending,
    isNewEntity,
    createAsync,
    updateAsync,
    deleteEntityAsync,
    isCreating,
    isUpdating,
    isDeleting,
} = createModuleDetailQuery<T>({
    module: () => props.module,
    entityId: () => props.id ?? null,
});

const formFields = computed<ISmartFormField[]>(() => {
    if (props.fields) {
        return props.fields;
    }
    return props.module.headers.map((header) => ({
        component: "v-text-field",
        key: header.key,
        props: {
            label: header.title,
        },
    }));
});

const initialValues = computed(() => {
    if (isNewEntity.value || !data.value) {
        return {};
    }
    return data.value;
});

const isSaving = computed(() => isCreating.value || isUpdating.value);

const listRoute = computed(() => ({
    name: `${capitalize(props.module.key)}List`,
}));

const handleBack = () => {
    toScreenRoute(listRoute.value);
};

const handleSaveEntity = async () => {
    if (!form.value) {
        return;
    }

    const formValues = form.value.values;

    if (isNewEntity.value) {
        const createdEntity = await createAsync(formValues);
        emit("created", createdEntity);
        router.push({
            name: `${capitalize(props.module.key)}Detail`,
            params: { id: createdEntity.id },
        });
    } else if (props.id) {
        const updatedEntity = await updateAsync({
            entityId: props.id,
            payload: formValues,
        });
        emit("updated", updatedEntity);
    }
};

const { handler: handleSave } = useFormSubmit(handleSaveEntity, form);

const handleOpenDeleteDialog = () => {
    isDeleteDialogOpen.value = true;
};

const handleConfirmDelete = async () => {
    if (!props.id) {
        return;
    }
    await deleteEntityAsync(props.id);
    emit("deleted", props.id);
    isDeleteDialogOpen.value = false;
    router.push(listRoute.value);
};

watch(
    () => data.value,
    (newData) => {
        if (newData && form.value) {
            form.value.resetForm(
                // @ts-expect-error vee-validate PartialDeep не работает с generic типами: https://github.com/logaretm/vee-validate/issues/4870
                { values: newData },
                { force: true }
            );
        }
    }
);
</script>

<style lang="scss" scoped>
.module-detail {
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

    &__card {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    &__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
    }
}
</style>
