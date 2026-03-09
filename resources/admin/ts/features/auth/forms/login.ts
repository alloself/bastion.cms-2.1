import { computed, ref } from 'vue'
import { VCheckbox, VTextField } from 'vuetify/components'
import { z } from 'zod'

import type { IBSmartFormField } from '@/ts/shared/components/BSmartForm'

const emailSchema = z
    .string()
    .trim()
    .min(1, 'Поле обязательно для заполнения')
    .email('Введите корректный email')

const passwordSchema = z
    .string()
    .min(1, 'Поле обязательно для заполнения')
    .min(8, 'Пароль должен содержать минимум 8 символов')

const rememberSchema = z.boolean().default(false)

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    remember: rememberSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const useLoginFormFields = () => {
    const showPassword = ref(false)

    const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value
    }

    const fields = computed<IBSmartFormField[]>(() => [
        {
            component: VTextField,
            key: 'email',
            props: {
                autocomplete: 'username',
                label: 'Почта',
                name: 'email',
                prependIcon: 'mdi-email-outline',
                type: 'email',
            },
            rule: emailSchema,
        },
        {
            component: VTextField,
            key: 'password',
            props: {
                autocomplete: 'current-password',
                appendInnerIcon: showPassword.value ? 'mdi-eye-off' : 'mdi-eye',
                label: 'Пароль',
                name: 'password',
                prependIcon: 'mdi-lock-outline',
                type: showPassword.value ? 'text' : 'password',
            },
            events: {
                'click:appendInner': togglePasswordVisibility,
            },
            rule: passwordSchema,
        },
        {
            component: VCheckbox,
            key: 'remember',
            props: {
                label: 'Запомнить меня',
                name: 'remember',
                hideDetails: true,
                density: 'compact',
            },
            rule: rememberSchema,
        },
    ])

    return {
        fields,
        togglePasswordVisibility,
        showPassword,
    }
}
