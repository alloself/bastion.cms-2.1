import { computed } from "vue";
import { z } from "zod";
import type { Template } from "@shared/types/models";
import { BCodeEditor, type IBSmartFormField } from "@/ts/shared/components";

const nameSchema = z
    .string()
    .trim()
    .min(1, "Поле обязательно для заполнения")

const valueSchema = z
    .string()
    .min(1, "Поле обязательно для заполнения")

export const templateSchema = z.object({
    name: nameSchema,
    value: valueSchema,
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

export const useTemplateForm = (entity?: Template) => {
    const fields = computed<IBSmartFormField[]>(() => {
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
                rule: nameSchema,
            },
            {
                component: BCodeEditor,
                key: "value",
                isGrow: true,
                props: {
                    name: "value",
                },
                rule: valueSchema,
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
