import { computed } from "vue";
import type { Page } from "@shared/types/models";
import type { ISmartFormField } from "@/ts/shared/types";
import {
    BJSONEditor,
    BRelationAutocomplete,
    BRelationTree,
} from "@/ts/shared/components";

export const usePageForm = (entity?: Page) => {
    const fields = computed<ISmartFormField[]>(() => {
        const baseFields: ISmartFormField[] = [
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
                    relations: ["link"],
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
                    label: "Главная",
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

        if (entity?.id) {
            baseFields.push({
                component: BRelationTree,
                key: "children",
                props: {
                    endpoint: "page",
                    parentId: entity.id,
                    itemTitle: "link.title",
                    label: "Дочерние страницы",
                    relations: ["link"],
                },
            });
        }

        return baseFields;
    });

    const layout = `
        "link.title link.title link.title"
        "link.url link.url link.url" 
        "index template_id template_id"
        "parent_id parent_id parent_id"
        "children children children"
    `;

    const createInitialValues = () => {
        return {
            index: false,
            parent_id: null,
            template_id: null,
            meta: null,
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
