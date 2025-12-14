import { computed } from "vue";
import type { PartialDeep } from "type-fest";
import type { IBaseEntity, ISmartFormField } from "@admin/ts/types";

export const usePageModuleForm = () => {
    const fields = computed<ISmartFormField[]>(() => {
        return [
            {
                component: "v-checkbox",
                key: "index",
                props: {
                    name: "index",
                    label: "Index",
                    density: "compact",
                },
            },
            {
                component: "v-text-field",
                key: "parent_id",
                props: {
                    name: "parent_id",
                    label: "Parent ID",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            },
            {
                component: "v-text-field",
                key: "template_id",
                props: {
                    name: "template_id",
                    label: "Template ID",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            },
            {
                component: "v-text-field",
                key: "link.title",
                props: {
                    name: "link.title",
                    label: "Заголовок",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            },
            {
                component: "v-text-field",
                key: "link.url",
                props: {
                    name: "link.url",
                    label: "Ссылка",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                },
            },
            {
                component: "v-textarea",
                key: "meta",
                props: {
                    name: "meta",
                    label: "Meta",
                    density: "compact",
                    variant: "filled",
                    rounded: "0",
                    clearable: true,
                    autoGrow: true,
                    rows: 3,
                },
            },
        ];
    });

    const createInitialValues = computed<PartialDeep<IBaseEntity> | undefined>(
        () => {
            return {
                index: false,
                link: {
                    title: "",
                    url: "",
                },
            };
        }
    );

    return {
        fields,
        createInitialValues,
    };
};
