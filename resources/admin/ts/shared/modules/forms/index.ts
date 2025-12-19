import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import type { PartialDeep } from "type-fest";
import type { IBaseEntity, ISmartFormField } from "@/admin/ts/shared/types";
import type { IModule } from "..";
import { usePageModuleForm } from "./page";
import { useTemplateModuleForm } from "./template";

export interface IModuleForm {
    fields: ComputedRef<ISmartFormField[]>;
    createInitialValues: ComputedRef<PartialDeep<IBaseEntity> | undefined>;
}

export const useModuleForm = (module: MaybeRefOrGetter<IModule>): IModuleForm => {
    const pageForm = usePageModuleForm();
    const templateForm = useTemplateModuleForm();

    const fields = computed<ISmartFormField[]>(() => {
        const moduleValue = toValue(module);

        if (moduleValue.key === "page") {
            return pageForm.fields.value;
        }

        if (moduleValue.key === "template") {
            return templateForm.fields.value;
        }

        return [];
    });

    const createInitialValues = computed<PartialDeep<IBaseEntity> | undefined>(() => {
        const moduleValue = toValue(module);

        if (moduleValue.key === "page") {
            return pageForm.createInitialValues.value;
        }

        if (moduleValue.key === "template") {
            return templateForm.createInitialValues.value;
        }

        return undefined;
    });

    return {
        fields,
        createInitialValues,
    };
};

export { usePageModuleForm } from "./page";
export { useTemplateModuleForm } from "./template";
