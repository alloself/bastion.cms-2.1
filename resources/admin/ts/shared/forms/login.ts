import type { ISmartFormField } from "@admin/ts/types";
import { ref, computed } from "vue";
import { z } from "zod";

const createZodFieldRule = <T extends z.ZodTypeAny>(schema: T) => {
    return (value: unknown) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            const [firstIssue] = result.error.issues;
            return firstIssue?.message || "Некорректное значение";
        }

        return true;
    };
};

const emailSchema = z
    .string()
    .trim()
    .min(1, "Поле обязательно для заполнения")
    .email("Введите корректный email");

const passwordSchema = z
    .string()
    .min(1, "Поле обязательно для заполнения")
    .min(8, "Пароль должен содержать минимум 8 символов");

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const emailRule = createZodFieldRule(emailSchema);
const passwordRule = createZodFieldRule(passwordSchema);

export const useLoginFormFields = () => {
    const showPassword = ref(false);

    const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value;
    };

    const fields = computed<ISmartFormField[]>(() => [
        {
            component: "v-text-field",
            key: "email",
            props: {
                autocomplete: "username",
                label: "Почта",
                name: "email",
                prependIcon: "mdi-email-outline",
                type: "email",
            },
            rule: emailRule,
        },
        {
            component: "v-text-field",
            key: "password",
            props: {
                autocomplete: "current-password",
                appendInnerIcon: showPassword.value ? "mdi-eye-off" : "mdi-eye",
                label: "Пароль",
                name: "password",
                prependIcon: "mdi-lock-outline",
                type: showPassword.value ? "text" : "password",
            },
            events: {
                "click:appendInner": togglePasswordVisibility,
            },
            rule: passwordRule,
        },
    ]);

    return {
        fields,
        togglePasswordVisibility,
        showPassword,
    };
};
