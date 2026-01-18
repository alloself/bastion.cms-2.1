<template>
    <form class="b-smart-form" :style="formGridStyle" @submit.prevent>
        <div
            v-for="schemeField in fields"
            :key="schemeField.key"
            class="b-smart-form__field"
            :class="{
                'b-smart-form__field--grow': schemeField.isGrow,
            }"
            :style="{ gridArea: toGridAreaName(schemeField.key) }"
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
                        v-bind="resolveFieldProps(schemeField.props)"
                        v-on="schemeField.events || {}"
                        class="mb-1"
                    />
                </Field>
            </slot>
        </div>
    </form>
</template>

<script lang="ts" setup generic="T extends GenericObject, K extends GenericObject">
import { Field, type GenericObject, useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import { z } from 'zod'

import type { TBSmartFormProps, TFieldProps } from './BSmartForm.types'

const {
    fields = [],
    initialValues,
    readonly = false,
    loading = false,
    layout,
} = defineProps<TBSmartFormProps<T, K>>()

const emits = defineEmits<{
    'update:form': [value: ReturnType<typeof useForm<T, K>>]
}>()

const toGridAreaName = (key: string): string => {
    return key.replace(/\./g, '-')
}

const mergedValidationSchema = computed(() => {
    const schemaShape = fields.reduce<Record<string, z.ZodType>>((shape, field) => {
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

const formGridStyle = computed<Record<string, string> | undefined>(() => {
    const trimmedLayout = layout?.trim()
    if (!trimmedLayout) {
        return undefined
    }

    const rowStrings = trimmedLayout.match(/"[^"]*"/g) ?? []
    const tokenRows = rowStrings.reduce<string[][]>((rows, rowString) => {
        const rowTokens = rowString.slice(1, -1).trim().split(/\s+/).filter(Boolean)

        if (rowTokens.length > 0) {
            rows.push(rowTokens)
        }

        return rows
    }, [])

    const maxColumns = tokenRows.reduce<number>((currentMax, rowTokens) => {
        return Math.max(currentMax, rowTokens.length)
    }, 0)
    if (maxColumns === 0) {
        return undefined
    }

    const usedFieldKeySet = new Set<string>(
        tokenRows
            .reduce<string[]>((flatTokens, rowTokens) => flatTokens.concat(rowTokens), [])
            .filter((token) => token !== '.'),
    )

    const gridTemplateAreaRows = tokenRows.map((rowTokens) => {
        const paddedTokens = [
            ...rowTokens.map(toGridAreaName),
            ...new Array<string>(maxColumns - rowTokens.length).fill('.'),
        ]

        return `"${paddedTokens.join(' ')}"`
    })

    const additionalRows = fields.reduce<string[]>((rows, field) => {
        if (!usedFieldKeySet.has(field.key)) {
            const areaName = toGridAreaName(field.key)
            rows.push(`"${new Array<string>(maxColumns).fill(areaName).join(' ')}"`)
        }
        return rows
    }, [])

    return {
        display: 'grid',
        gridTemplateAreas: [...gridTemplateAreaRows, ...additionalRows].join('\n'),
        gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
        gridAutoRows: 'min-content',
        columnGap: '8px',
    }
})

const formContext = useForm<T, K>({
    validationSchema: mergedValidationSchema,
    initialValues: initialValues,
    keepValuesOnUnmount: true,
    validateOnMount: false,
})

const resolveFieldProps = (fieldProps: TFieldProps = {}) => {
    return Object.entries(fieldProps).reduce<Record<string, unknown>>(
        (resolvedProps, [propKey, propValue]) => {
            if (typeof propValue === 'function') {
                resolvedProps[propKey] = propValue(formContext.values)
            } else {
                resolvedProps[propKey] = propValue
            }
            return resolvedProps
        },
        {},
    )
}

emits('update:form', formContext)

watch(
    () => initialValues,
    (newValues) => {
        if (newValues) {
            formContext.resetForm({
                values: newValues,
            })
        }
    },
    { deep: true },
)
</script>

<style lang="scss" scoped>
.b-smart-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;

    &__field {
        display: flex;
        flex-direction: column;
        min-height: 0;

        &--grow {
            flex: 1 1 auto;
            min-height: 0;
        }
    }
}
</style>
