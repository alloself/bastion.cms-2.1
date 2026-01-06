<template>
    <VContainer class="fill-height" fluid>
        <VRow :align="'center'" justify="center" no-gutters class="fill-height">
            <VCol cols="12" sm="8" md="4">
                <VCard class="elevation-12" @keyup.enter="handler">
                    <VToolbar dark flat>
                        <BLogo />
                        <VToolbarTitle>Вход</VToolbarTitle>
                        <VSpacer></VSpacer>
                    </VToolbar>
                    <VCardText>
                        <b-smart-form
                            :loading="loading"
                            :fields="fields"
                            :initial-values="initialValues"
                            v-model:form="form"
                        ></b-smart-form>
                    </VCardText>
                    <VCardActions>
                        <VSpacer></VSpacer>
                        <VBtn depressed @click="handler" :loading="loading"
                            >Вход</VBtn
                        >
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script setup lang="ts">
import { BLogo, BSmartForm } from "@/ts/shared/components";
import { useLoginFormFields, type LoginFormValues } from "@/ts/shared/forms";
import type { FormContext } from "vee-validate";
import { ref } from "vue";
import { useFormSubmit, routeNames, isValidRedirectPath } from "@/ts/shared";
import { useAuthStore } from "@/ts/features/auth";
import { useRouter, useRoute } from "vue-router";

const form = ref<FormContext<LoginFormValues, LoginFormValues>>();
const loading = ref(false);

const { fields } = useLoginFormFields();
const { login } = useAuthStore();
const router = useRouter();
const route = useRoute();

const initialValues =
    import.meta.env.MODE === "development"
        ? {
              email: "root@example.com",
              password: "password",
          }
        : undefined;

const isSafeRedirect = (value: unknown): value is string => {
    if (!isValidRedirectPath(value)) {
        return false;
    }
    return router.resolve(value).matched.length > 0;
};

const handleLogin = async () => {
    if (!form.value) {
        return;
    }

    loading.value = true;
    try {
        await login(form.value.values);

        const redirectPath = route.query.redirect;
        if (isSafeRedirect(redirectPath)) {
            await router.push(redirectPath);
        } else {
            await router.push({ name: routeNames.Authenticated });
        }
    } finally {
        loading.value = false;
    }
};

const { handler } = useFormSubmit(handleLogin, form);
</script>
