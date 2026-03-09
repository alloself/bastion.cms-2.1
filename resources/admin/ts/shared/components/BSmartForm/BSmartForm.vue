<template>
    <form class="b-smart-form" :class="{ 'b-smart-form--grid': layout }" @submit.prevent>
        <div
            v-for="field in fields"
            :key="field.key"
            class="b-smart-form__field"
            :style="getGridArea(field.key)"
        >
            <slot :name="field.key">
                <Field :name="field.key" v-slot="{ value, handleChange, errors }">
                    <component
                        :is="field.component"
                        :model-value="value"
                        :readonly="readonly"
                        :disabled="loading"
                        @update:modelValue="handleChange"
                        :error-messages="errors"
                        v-bind="field.props || {}"
                        v-on="field.events || {}"
                        class="mb-1"
                    />
                </Field>
            </slot>
        </div>
    </form>
</template>

<script lang="ts" setup generic="T extends GenericObject, K extends GenericObject">
import { Field, type FormContext, type GenericObject, useForm } from 'vee-validate'
import { computed } from 'vue'
import { z } from 'zod'

import type { TBSmartFormProps } from './BSmartForm.types'

const {
    fields = [],
    initialValues,
    readonly = false,
    loading = false,
    layout = '',
} = defineProps<TBSmartFormProps<T>>()

const form = defineModel<FormContext<T, K>>('form')

const validationSchema = computed(() => {
    const schemaShape = fields.reduce((shape, field) => {
        if (!field.rule) {
            return shape
        }

        return {
            ...shape,
            [field.key]: field.rule,
        }
    }, {})

    return z.object(schemaShape)
})

form.value = useForm<T, K>({
    validationSchema,
    initialValues,
    keepValuesOnUnmount: true,
    validateOnMount: false,
})

const getGridArea = (key: string) => {
    return {
        gridArea: key,
    }
}
</script>

<style lang="scss" scoped>
.b-smart-form {
    display: flex;
    flex-direction: column;

    &--grid {
        display: grid;
        grid-template-areas: v-bind(layout);
        grid-auto-rows: min-content;
    }
}
</style>
