<template>
    <form
        class="smart-form"
        @submit.prevent
        :class="formClasses"
        :style="formStyle"
    >
        <slot
            v-for="schemeField in normalizedFields"
            :name="schemeField.key"
            :key="schemeField.uniqueKey"
        >
            <div
                class="smart-form__field"
                :class="schemeField.wrapperClass"
                :style="schemeField.wrapperStyle"
                v-bind="schemeField.wrapperAttrs"
            >
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
                        v-bind="schemeField.props"
                        v-on="schemeField.events"
                        class="mb-1"
                    ></Component>
                </Field>
            </div>
        </slot>
    </form>
</template>

<script
    lang="ts"
    setup
    generic="T extends GenericObject,K extends GenericObject"
>
import { computed, watch } from "vue";
import type { StyleValue } from "vue";
import {
    useForm,
    Field,
    type FormContext,
    type GenericObject,
} from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { ISmartFormField, ISmartFormProps } from "@admin/ts/types";

const {
    fields = [],
    initialValues,
    readonly = false,
    initialItems = {},
    layout,
    loading = false,
} = defineProps<ISmartFormProps<T, K>>();

const emits = defineEmits<{
    "update:form": [value: FormContext<T, K>];
}>();

const mergedValidationSchema = computed(() => {
    const schemaShape = fields.reduce(
        (shape, field) => {
            if (field.rule) {
                shape[field.key] = field.rule;
            }
            return shape;
        },
        {} as Record<string, z.ZodType>
    );

    return toTypedSchema(z.object(schemaShape));
});

const formContext = useForm<T, K>({
    validationSchema: mergedValidationSchema,
    initialValues: initialValues,
    keepValuesOnUnmount: true,
    validateOnMount: false,
});

emits("update:form", formContext);

const getInitialItems = (field: ISmartFormField) => {
    return field.key in initialItems
        ? initialItems[field.key]
        : field.props?.initialItems || [];
};

const normalizedFields = computed(() => {
    return fields.map((field) => {
        return {
            ...field,
            uniqueKey: field.key,
            props: {
                ...(field.props || {}),
                initialItems: getInitialItems(field),
            },
            events: {
                ...(field.events || {}),
            },
            wrapperClass: field.wrapperClass,
            wrapperStyle: field.wrapperStyle,
            wrapperAttrs: field.wrapperAttrs || {},
        };
    });
});

const isGridLayout = computed(() => layout?.type === "grid");

const gridStyle = computed<StyleValue | undefined>(() => {
    if (!isGridLayout.value) {
        return undefined;
    }

    const style: Record<string, string> = {
        display: "grid",
        "grid-template-columns":
            layout?.columns ||
            (layout?.minColumnWidth
                ? `repeat(auto-fit, minmax(${layout?.minColumnWidth}, 1fr))`
                : "repeat(auto-fit, minmax(280px, 1fr))"),
    };

    if (layout?.gap) {
        style.gap = layout?.gap;
    }

    if (!layout?.gap) {
        if (layout?.columnGap) {
            style["column-gap"] = layout?.columnGap;
        }
        if (layout?.rowGap) {
            style["row-gap"] = layout?.rowGap;
        }
    } else {
        if (layout?.columnGap) {
            style["column-gap"] = layout?.columnGap;
        }
        if (layout?.rowGap) {
            style["row-gap"] = layout?.rowGap;
        }
    }

    if (!layout?.gap && !layout?.columnGap && !layout?.rowGap) {
        style.gap = "1rem";
    }

    if (layout?.autoRows) {
        style["grid-auto-rows"] = layout?.autoRows;
    }

    if (layout?.alignItems) {
        style["align-items"] = layout?.alignItems;
    }

    if (layout?.justifyItems) {
        style["justify-items"] = layout?.justifyItems;
    }

    return style;
});

const formClasses = computed(() => [
    { "smart-form--grid": isGridLayout.value },
    layout?.class,
]);

const formStyle = computed<StyleValue | undefined>(() => {
    const baseStyle = layout?.style;
    const extraStyle = gridStyle.value;

    if (extraStyle) {
        if (Array.isArray(baseStyle)) {
            return [...baseStyle, extraStyle];
        }

        if (baseStyle) {
            return [baseStyle, extraStyle];
        }

        return extraStyle;
    }

    return baseStyle;
});

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

<style lang="scss" scoped>
.smart-form {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem;

    & > * {
        flex: none;
    }
}

.smart-form--grid {
    flex-direction: initial;
}

.smart-form__field {
    width: 100%;
    min-width: 0;
}
</style>
