import { computed } from "vue";
import type { PartialDeep } from "type-fest";
import type { IBaseEntity, ISmartFormField } from "@admin/ts/types";

export const useTemplateModuleForm = () => {
    const fields = computed<ISmartFormField[]>(() => {
        return [
            {
                component: "v-text-field",
                key: "name",
                props: {
                    name: "name",
                    label: "Название",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            },
            {
                component: "v-textarea",
                key: "value",
                props: {
                    name: "value",
                    label: "Значение",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                    autoGrow: true,
                    rows: 8,
                },
            },
        ];
    });

    const createInitialValues = computed<PartialDeep<IBaseEntity> | undefined>(
        () => {
            return {
                name: "",
                value: "",
            };
        }
    );

    return {
        fields,
        createInitialValues,
    };
};
