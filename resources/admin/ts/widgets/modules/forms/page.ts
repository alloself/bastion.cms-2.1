import { computed } from "vue";
import type { ISmartFormField } from "@/ts/shared/types";
import type { Page } from "@shared/types/models";
import { BJSONEditor, BRelationAutocomplete } from "@/ts/shared/components";

export const usePageForm = (entity?: Page) => {
    const fields = computed<ISmartFormField[]>(() => {
        return [
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
                component: BRelationAutocomplete,
                key: "parent_id",
                props: {
                    endpoint: "page",
                    itemTitle: "link.title",
                    label: "Родительская страница",
                    placeholder: "Выберите родителя",
                    clearable: true,
                },
            },
            {
                component: BRelationAutocomplete,
                key: "template_id",
                props: {
                    endpoint: "template",
                    itemTitle: "name",
                    label: "Шаблон",
                    placeholder: "Выберите шаблон",
                },
            },
            {
                component: "v-checkbox",
                key: "index",
                props: {
                    name: "index",
                    label: "Индексировать",
                    density: "compact",
                    hideDetails: true,
                },
            },
            {
                component: BJSONEditor,
                key: "meta",
                props: {
                    name: "meta",
                    label: "Мета-теги",
                },
            },
        ];
    });

    const layout = `
        "link.title link.title"
        "link.url link.url" 
        "index template_id"
        "parent_id parent_id"
    `;

    const createInitialValues = () => {
        return {
            index: false,
            parent_id: null,
            link: {
                title: "",
                url: "",
            },
        };
    };

    return {
        fields,
        layout,
        createInitialValues,
    };
};
