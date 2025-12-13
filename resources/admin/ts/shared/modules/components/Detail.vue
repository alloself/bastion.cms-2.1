<template>
    <div class="module-detail">
        <VCard
            class="module-detail__card"
            outlined
            rounded="0"
            flat
        >
            <VToolbar density="compact" class="module-detail__toolbar">
                <VToolbarTitle class="module-detail__title">
                    {{ headerTitle }}
                </VToolbarTitle>

                <VSpacer />

                <VBtn
                    v-if="isViewMode"
                    icon
                    size="small"
                    :disabled="isActionsDisabled"
                    @click="handleEditClick"
                >
                    <VIcon>mdi-pencil</VIcon>
                </VBtn>

                <VBtn
                    v-if="isEditMode"
                    icon
                    size="small"
                    :loading="isSaveLoading"
                    :disabled="isActionsDisabled"
                    @click="handleSaveClick"
                >
                    <VIcon>mdi-content-save</VIcon>
                </VBtn>

                <VBtn
                    v-if="isEditMode"
                    icon
                    size="small"
                    :disabled="isActionsDisabled"
                    @click="handleCancelEditClick"
                >
                    <VIcon>mdi-close</VIcon>
                </VBtn>

                <VBtn
                    v-if="!isNewEntity"
                    icon
                    size="small"
                    color="error"
                    :loading="detailQuery.isDeleting.value"
                    :disabled="isActionsDisabled"
                    @click="handleDeleteClick"
                >
                    <VIcon>mdi-delete</VIcon>
                </VBtn>
            </VToolbar>

            <VDivider role="separator" />

            <div class="module-detail__content">
                <VSkeletonLoader
                    v-if="isEntityLoading"
                    type="article@3"
                />

                <VEmptyState
                    v-else-if="isEntityError"
                    icon="mdi-alert-circle-outline"
                    title="Ошибка загрузки"
                    text="Не удалось загрузить данные. Попробуйте обновить страницу."
                    justify="center"
                />

                <BSmartForm
                    v-else
                    v-model:form="form"
                    :fields="fields"
                    :initial-values="initialValues"
                    :readonly="isViewMode"
                    :loading="isSaveLoading"
                    class="module-detail__form"
                />
            </div>
        </VCard>
    </div>
</template>

<script setup lang="ts">
import type { IBaseEntity, ISmartFormField, TDetailViewMode } from "@admin/ts/types";
import BSmartForm from "@admin/ts/shared/components/BSmartForm.vue";
import type { IModule } from "@admin/ts/shared/modules";
import { createModuleDetailQuery } from "@admin/ts/shared/modules/queries";
import { computed, ref, capitalize } from "vue";
import type { FormContext } from "vee-validate";
import { useFormSubmit } from "@admin/ts/shared/composables/useFormSubmit";
import { useRouter } from "vue-router";
import { useScreenStore } from "@admin/ts/features/screen";
import { isPlainRecord } from "@admin/ts/shared/typeGuards";

type TModuleEntity = IBaseEntity;

const props = defineProps<{
    module: IModule;
    tabFullPath: string;
    id?: unknown;
}>();

const router = useRouter();
const screenStore = useScreenStore();

const moduleValue = computed(() => props.module);

const normalizeEntityId = (value: unknown): string | null => {
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized !== "" ? normalized : null;
    }

    if (Array.isArray(value) && value.length > 0) {
        const [firstValue] = value;
        if (typeof firstValue === "string") {
            const normalized = firstValue.trim();
            return normalized !== "" ? normalized : null;
        }
    }

    return null;
};

const entityId = computed(() => normalizeEntityId(props.id));

const detailQuery = createModuleDetailQuery<TModuleEntity>({
    module: moduleValue,
    entityId,
});

const defaultViewMode = computed<TDetailViewMode>(() => {
    return detailQuery.isNewEntity.value ? "edit" : "view";
});

const parseViewModeFromFullPath = (
    fullPath: string,
    fallback: TDetailViewMode
): TDetailViewMode => {
    try {
        const url = new URL(fullPath, "http://localhost");
        const modeValue = url.searchParams.get("mode");
        if (modeValue === "edit" || modeValue === "view") {
            return modeValue;
        }
        return fallback;
    } catch (error) {
        console.warn("Failed to parse module detail fullPath", {
            fullPath,
            error,
        });
        return fallback;
    }
};

const buildFullPathWithMode = (baseFullPath: string, mode: TDetailViewMode) => {
    const url = new URL(baseFullPath, "http://localhost");
    const searchParams = new URLSearchParams(url.search);

    searchParams.set("mode", mode);

    const nextQueryString = searchParams.toString();
    const nextPath = nextQueryString ? `${url.pathname}?${nextQueryString}` : url.pathname;

    return url.hash ? `${nextPath}${url.hash}` : nextPath;
};

const viewMode = computed<TDetailViewMode>(() => {
    return parseViewModeFromFullPath(props.tabFullPath, defaultViewMode.value);
});

const isEditMode = computed(() => viewMode.value === "edit");
const isViewMode = computed(() => viewMode.value === "view");

const replaceUrlForActiveTab = async (nextFullPath: string) => {
    const currentFullPath = router.currentRoute.value.fullPath;
    if (currentFullPath !== nextFullPath) {
        await router.replace(nextFullPath);
    }
    screenStore.setActiveScreenTabRoute(router.currentRoute.value);
};

const patchViewMode = async (nextMode: TDetailViewMode) => {
    if (nextMode === viewMode.value) {
        return;
    }
    const nextFullPath = buildFullPathWithMode(props.tabFullPath, nextMode);
    await replaceUrlForActiveTab(nextFullPath);
};

const isNewEntity = computed(() => detailQuery.isNewEntity.value);

const fields = computed<ISmartFormField[]>(() => {
    return moduleValue.value.headers.map((header) => ({
        component: "v-text-field",
        key: header.key,
        props: {
            label: header.title,
            name: header.key,
        },
    }));
});

const initialValues = computed<Partial<TModuleEntity>>(() => {
    const data = detailQuery.data.value;
    if (data && isPlainRecord(data)) {
        return data;
    }
    return {};
});

const form = ref<FormContext<Partial<TModuleEntity>>>();

const isEntityLoading = computed(() => {
    return !!entityId.value && (detailQuery.isLoading.value || detailQuery.isPending.value);
});

const isEntityError = computed(() => {
    return !!entityId.value && !!detailQuery.error.value;
});

const isSaveLoading = computed(() => {
    return detailQuery.isCreating.value || detailQuery.isUpdating.value;
});

const isActionsDisabled = computed(() => {
    return isEntityLoading.value || isSaveLoading.value || detailQuery.isDeleting.value;
});

const headerTitle = computed(() => {
    const currentId = entityId.value;
    if (!currentId) {
        return moduleValue.value.title;
    }
    return `${moduleValue.value.title} #${currentId}`;
});

const resolveListRouteName = () => {
    return `${capitalize(moduleValue.value.key)}List`;
};

const resolveDetailRouteName = () => {
    return `${capitalize(moduleValue.value.key)}Detail`;
};

const buildPayloadFromFormValues = (values: Partial<TModuleEntity>) => {
    const payload: Partial<TModuleEntity> = {};
    const keys = moduleValue.value.headers.map((header) => header.key);

    const valuesRecord: Record<string, unknown> = values;
    const payloadRecord: Record<string, unknown> = payload;

    const getValueByPath = (source: Record<string, unknown>, path: string): unknown => {
        const parts = path
            .split(".")
            .map((part) => part.trim())
            .filter((part) => part !== "");

        if (parts.length === 0) {
            return undefined;
        }

        let current: unknown = source;
        for (const part of parts) {
            if (!isPlainRecord(current)) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    };

    const setValueByPath = (
        target: Record<string, unknown>,
        path: string,
        value: unknown
    ): void => {
        const parts = path
            .split(".")
            .map((part) => part.trim())
            .filter((part) => part !== "");

        if (parts.length === 0) {
            return;
        }

        const lastIndex = parts.length - 1;
        let currentTarget: Record<string, unknown> = target;

        parts.forEach((part, index) => {
            if (index === lastIndex) {
                currentTarget[part] = value;
                return;
            }

            const existingValue = currentTarget[part];
            if (isPlainRecord(existingValue)) {
                currentTarget = existingValue;
                return;
            }

            const nextContainer: Record<string, unknown> = {};
            currentTarget[part] = nextContainer;
            currentTarget = nextContainer;
        });
    };

    keys.forEach((key) => {
        const value = getValueByPath(valuesRecord, key);
        if (value !== undefined) {
            setValueByPath(payloadRecord, key, value);
        }
    });

    if ("id" in payloadRecord) {
        delete payloadRecord.id;
    }

    return payload;
};

const saveEntity = async () => {
    const formValue = form.value;
    if (!formValue) {
        return;
    }

    const payload = buildPayloadFromFormValues(formValue.values);

    if (isNewEntity.value) {
        const createdEntity = await detailQuery.createAsync(payload);
        const createdId = createdEntity?.id;
        if (typeof createdId === "string" && createdId.trim() !== "") {
            await router.replace({
                name: resolveDetailRouteName(),
                params: { id: createdId },
                query: { mode: "view" },
            });
            screenStore.setActiveScreenTabRoute(router.currentRoute.value);
            return;
        }

        detailQuery.setEntityData(createdEntity);
        await patchViewMode("view");
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

    await patchViewMode("view");
};

const { handler: handleSaveClick } = useFormSubmit(saveEntity, form);

const handleEditClick = () => {
    void patchViewMode("edit");
};

const handleCancelEditClick = () => {
    const formValue = form.value;
    if (formValue) {
        formValue.resetForm({ values: initialValues.value });
    }

    if (isNewEntity.value) {
        void toListRoute();
        return;
    }

    void patchViewMode("view");
};

const toListRoute = async () => {
    try {
        await router.push({ name: resolveListRouteName() });
        screenStore.setActiveScreenTabRoute(router.currentRoute.value);
    } catch (error) {
        console.error("Failed to navigate to module list", {
            moduleKey: moduleValue.value.key,
            error,
        });
    }
};

const handleDeleteClick = async () => {
    const currentEntityId = entityId.value;
    if (!currentEntityId) {
        return;
    }

    const shouldDelete = window.confirm("Удалить запись?");
    if (!shouldDelete) {
        return;
    }

    try {
        await detailQuery.deleteEntityAsync(currentEntityId);
        await toListRoute();
    } catch (error) {
        console.error("Failed to delete module entity", {
            moduleKey: moduleValue.value.key,
            entityId: currentEntityId,
            error,
        });
    }
};
</script>

<style lang="scss" scoped>
.module-detail {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;

    &__card {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
    }

    &__toolbar {
        flex: 0 0 auto;
    }

    &__content {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
    }

    &__form {
        flex: 1 1 auto;
        min-height: 0;
    }
}
</style>
