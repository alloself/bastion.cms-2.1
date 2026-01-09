import { computed } from "vue";
import type { ISmartFormField } from "@/ts/shared/types";
import type { Page } from "@shared/types/models";
import { BJSONEditor } from "@/ts/shared/components";

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
                component: BJSONEditor,
                key: "meta",
                props: {
                    name: "meta",
                },
            },
        ];
    });

    const createInitialValues = () => {
        return {
            index: false,
            link: {
                title: "",
                url: "",
            },
        };
    };
    return {
        fields,
        createInitialValues,
    };
};
