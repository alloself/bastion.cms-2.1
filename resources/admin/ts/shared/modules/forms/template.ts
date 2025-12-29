import { computed } from "vue";
import type { ISmartFormField } from "../../types";
import type { Template } from "@shared/types/models";

export const useTemplateForm = (entity: Template) => {
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
                    label: "Шаблон",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                    autoGrow: true,
                    rows: 6,
                },
            },
        ];
    });

    const createInitialValues = computed(() => {
        return {
            name: "",
            value: "",
        };
    });

    return {
        fields,
        createInitialValues,
    };
};

