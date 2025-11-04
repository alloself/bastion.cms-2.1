<template>
    <v-container class="fill-height" fluid>
        <v-row
            :align="'center'"
            justify="center"
            no-gutters
            class="fill-height"
        >
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12" @keyup.enter="handler">
                    <v-toolbar dark flat>
                        <BLogo />
                        <v-toolbar-title>Вход</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text class="pa-0">
                        <b-smart-form
                            :loading="loading"
                            :fields="fields"
                            :initial-values="initialValues"
                            v-model:form="form"
                        ></b-smart-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn depressed @click="handler" :loading="loading"
                            >Вход</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import BLogo from "@admin/ts/shared/components/BLogo.vue";
import {
    useLoginFormFields,
    type LoginFormValues,
} from "@admin/ts/shared/forms/login";
import BSmartForm from "@admin/ts/shared/components/BSmartForm.vue";
import type { FormContext } from "vee-validate";
import { onBeforeMount, ref } from "vue";
import { useFormSubmit } from "@admin/ts/shared/composables/useFormSubmit";
import { useUserStore } from "@admin/ts/entities/user/store";
import { useRouter } from "vue-router";

const form = ref<FormContext<LoginFormValues>>();
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const { fields } = useLoginFormFields();

const initialValues =
    import.meta.env.MODE === "development"
        ? {
              email: "root@example.com",
              password: "password",
          }
        : {};

const login = async () => {
    if (!form.value) {
        return;
    }

    loading.value = true;
    try {
        const values = form.value.values;
        await userStore.login({
            email: values.email,
            password: values.password,
        });
        await router.push("/");
    } finally {
        loading.value = false;
    }
};

const { handler } = useFormSubmit(login, form);

onBeforeMount(async () => {
    if (userStore.user) {
        await router.push({ name: "Authenticated" });
    }
});
</script>
