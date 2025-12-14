<template>
    <form class="smart-form" @submit.prevent>
        <slot
            v-for="schemeField in normalizedFields"
            :name="schemeField.key"
            :key="schemeField.uniqueKey"
        >
            <div class="smart-form__field">
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

<script lang="ts" setup generic="T extends IBaseEntity,K extends IBaseEntity">
import { computed, watch } from "vue";
import { useForm, Field, type FormContext } from "vee-validate";
import { z } from "zod";
import type { IBaseEntity, ISmartFormProps } from "@admin/ts/types";

const {
    fields = [],
    initialValues,
    readonly = false,
    loading = false,
} = defineProps<ISmartFormProps<T, K>>();

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

const normalizedFields = computed(() => {
    return fields.map((field) => {
        return {
            ...field,
            uniqueKey: field.key,
            props: {
                ...(field.props || {}),
            },
            events: {
                ...(field.events || {}),
            },
        };
    });
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
</style>
