import { computed } from "vue";
import type { Template } from "@shared/types/models";
import type { ISmartFormField } from "../../types";
import { BCodeEditor } from "../../components";

export const useTemplateForm = (entity?: Template) => {
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
                component: BCodeEditor,
                key: "value",
                isGrow: true,
                props: {
                    name: "value",
                },
            },
        ];
    });

    const createInitialValues = () => {
        if (!entity) {
            return {
                name: "",
                value: "",
            };
        }

        return entity;
    };

    return {
        fields,
        createInitialValues,
    };
};
