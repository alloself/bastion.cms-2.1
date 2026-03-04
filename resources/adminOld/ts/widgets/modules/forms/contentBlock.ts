import { computed } from 'vue'
import { z } from 'zod'

import { type IBSmartFormField } from '@/ts/shared/components'

const nameSchema = z.string().trim().min(1, 'Поле обязательно для заполнения')

export const contentBlockSchema = z.object({
    name: nameSchema,
})

export type ContentBlockFormValues = z.infer<typeof contentBlockSchema>

export const useContentBlockForm = () => {
    const fields = computed<IBSmartFormField[]>(() => {
        return [
            {
                component: 'v-text-field',
                key: 'name',
                props: {
                    name: 'name',
                    label: 'Название',
                    density: 'compact',
                    variant: 'filled',
                    rounded: '0',
                    clearable: true,
                },
                rule: nameSchema,
            },
        ]
    })

    const createInitialValues = () => {
        return {
            name: '',
        }
    }

    return {
        fields,
        createInitialValues,
    }
}
