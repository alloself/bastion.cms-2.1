<template>
    <form class="smart-form" @submit.prevent>
        <div
            v-for="schemeField in fields"
            :key="schemeField.key"
            class="smart-form__field"
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
} = defineProps<{
    fields: ISmartFormField[];
    form?: FormContext<T, K>;
    initialValues?: PartialDeep<T>;
    loading?: boolean;
    readonly?: boolean;
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
