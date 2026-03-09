<template>
    <VContainer class="h-full flex items-center justify-center" fluid>
        <VCard class="elevation-12 w-full max-w-[400px]" @keyup.enter="handler">
            <VToolbar density="compact">
                <BLogo />
                <VToolbarTitle>Вход</VToolbarTitle>
                <VSpacer></VSpacer>
            </VToolbar>
            <VCardText>
                <BSmartForm
                    :fields="fields"
                    :initial-values="initialValues"
                    v-model:form="form"
                    :loading="isLoading"
                />
            </VCardText>
            <VCardActions>
                <VBtn block variant="tonal" @click="handler" :loading="isLoading">Вход</VBtn>
            </VCardActions>
        </VCard>
    </VContainer>
</template>

<script setup lang="ts">
import type { FormContext } from 'vee-validate'
import { shallowRef } from 'vue'

import { BLogo, BSmartForm } from '@/ts/shared/components'

import { type LoginFormValues, useLoginFormFields, useLoginMutation } from '../features/auth'
import { useFormSubmit } from '../shared/composables'

const { fields } = useLoginFormFields()

const form = shallowRef<FormContext<LoginFormValues, LoginFormValues>>()

const { mutate: login, isLoading } = useLoginMutation()

const { handler } = useFormSubmit(async () => {
    if (!form.value) {
        return
    }
    await login(form.value.values)
}, form)

const initialValues =
    import.meta.env.MODE === 'development'
        ? {
              email: 'root@example.com',
              password: 'password',
          }
        : undefined
</script>
