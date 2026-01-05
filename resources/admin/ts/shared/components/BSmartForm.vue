<template>
    <form class="smart-form" :style="formGridStyle" @submit.prevent>
        <div
            v-for="schemeField in fields"
            :key="schemeField.key"
            class="smart-form__field"
            :style="{ gridArea: schemeField.key }"
        >
            <slot :name="schemeField.key">
                <Field
                    :name="schemeField.key"
                    :validate-on-mount="false"
                    :validate-on-blur="false"
                    :validate-on-input="false"
                    v-slot="{ value, handleChange, errors }"
                >
                    <Component
                        :loading="loading"
                        :is="schemeField.component"
                        :model-value="value"
                        :readonly="readonly || schemeField.readonly"
                        @update:modelValue="handleChange"
                        :error-messages="errors"
                        v-bind="schemeField.props || {}"
                        v-on="schemeField.events || {}"
                        class="mb-1"
                    ></Component>
                </Field>
            </slot>
        </div>
    </form>
</template>

<script
    lang="ts"
    setup
    generic="T extends GenericObject,K extends GenericObject"
>
import { computed, watch } from "vue";
import {
    useForm,
    Field,
    type FormContext,
    type GenericObject,
} from "vee-validate";
import { z } from "zod";
import type { PartialDeep } from "type-fest";
import type { ISmartFormField } from "../types";

const {
    fields = [],
    initialValues,
    readonly = false,
    loading = false,
    layout,
} = defineProps<{
    fields: ISmartFormField[];
    form?: FormContext<T, K>;
    initialValues?: PartialDeep<T>;
    loading?: boolean;
    readonly?: boolean;
    layout?: string;
    initialItems?: Record<string, unknown>;
}>();

const emits = defineEmits<{
    "update:form": [value: FormContext<T, K>];
}>();

const mergedValidationSchema = computed(() => {
    const schemaShape = fields.reduce<Record<string, z.ZodType>>(
        (shape, field) => {
            if (!field.rule) {
                return shape;
            }

            return {
                ...shape,
                [field.key]: field.rule,
            };
        },
        {}
    );

    return z.object(schemaShape);
});

const formGridStyle = computed<Record<string, string> | undefined>(() => {
    const trimmedLayout = layout?.trim();
    if (!trimmedLayout) {
        return undefined;
    }

    const rowStrings = trimmedLayout.match(/"[^"]*"/g) ?? [];
    const tokenRows = rowStrings.reduce<string[][]>((rows, rowString) => {
        const rowTokens = rowString
            .slice(1, -1)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (rowTokens.length > 0) {
            rows.push(rowTokens);
        }

        return rows;
    }, []);

    const maxColumns = tokenRows.reduce<number>((currentMax, rowTokens) => {
        return Math.max(currentMax, rowTokens.length);
    }, 0);
    if (maxColumns === 0) {
        return undefined;
    }

    const usedFieldKeySet = new Set<string>(
        tokenRows
            .reduce<string[]>(
                (flatTokens, rowTokens) => flatTokens.concat(rowTokens),
                []
            )
            .filter((token) => token !== ".")
    );

    const gridTemplateAreaRows = tokenRows.map((rowTokens) => {
        const paddedTokens = [
            ...rowTokens,
            ...new Array<string>(maxColumns - rowTokens.length).fill("."),
        ];

        return `"${paddedTokens.join(" ")}"`;
    });

    const additionalRows = fields.reduce<string[]>((rows, field) => {
        if (!usedFieldKeySet.has(field.key)) {
            rows.push(
                `"${new Array<string>(maxColumns).fill(field.key).join(" ")}"`
            );
        }
        return rows;
    }, []);

    return {
        display: "grid",
        gridTemplateAreas: [...gridTemplateAreaRows, ...additionalRows].join("\n"),
        gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
        gap: "8px",
    };
});

const formContext = useForm<T, K>({
    validationSchema: mergedValidationSchema,
    initialValues: initialValues,
    keepValuesOnUnmount: true,
    validateOnMount: false,
});

emits("update:form", formContext);

watch(
    () => initialValues,
    (newValues) => {
        if (newValues) {
            formContext.resetForm({
                values: newValues,
            });
        }
    },
    { deep: true }
);
</script>

<style lang="scss" scoped></style>
