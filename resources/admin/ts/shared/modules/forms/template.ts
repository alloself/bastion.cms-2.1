import { computed } from "vue";
import type { PartialDeep } from "type-fest";
import type { IBaseEntity, ISmartFormField } from "@/admin/ts/shared/types";
import BCodeEditor from "@admin/ts/shared/components/BCodeEditor";

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
                component: BCodeEditor,
                key: "value",
                props: {
                    name: "value",
                    label: "Значение",
                    options: {
                        wordWrap: "on",
                        tabSize: 4,
                    },
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
