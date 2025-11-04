import type { FormContext } from "vee-validate";
import type { Ref } from "vue";

const formatResponseErrors = (
    errors: Record<string, string[]>,
    prefixMap: Record<string, string> = {}
) => {
    const formatted: Record<string, string[]> = {};

    Object.entries(errors).forEach(([key, messages]) => {
        const prefixedKey = prefixMap[key] ? `${prefixMap[key]}${key}` : key;
        formatted[prefixedKey] = messages;
    });

    return formatted;
};

export const useFormSubmit = (
    fn: () => Promise<void>,
    form: Ref<FormContext | undefined>
) => {
    const handler = async () => {
        if (!form.value) {
            return;
        }
        try {
            const validationResult = await form.value.validate();
            if (!validationResult.valid) {
                return;
            }
            await fn();
        } catch (error: unknown) {
            const formErrors = extractFormErrors(error);

            if (formErrors && form.value) {
                const formattedErrors = formatResponseErrors(formErrors, {
                    title: "link.",
                    subtitle: "link.",
                });
                form.value.setErrors(formattedErrors);
            }
        }
    };

    return { handler };
};

type ErrorResponse = {
    response?: {
        data?: {
            errors?: Record<string, unknown>;
            message?: string;
        };
    };
};

const translateMessage = (message: string): string => {
    const translations: Record<string, string> = {
        "auth.failed": "Предоставленные учетные данные не совпадают с нашими записями.",
        "auth.password": "Предоставленный пароль неверен.",
        "auth.throttle": "Слишком много попыток входа. Пожалуйста, попробуйте снова позже.",
    };

    return translations[message] || message;
};

function extractFormErrors(error: unknown): Record<string, string[]> | null {
    if (!error || typeof error !== "object") {
        return null;
    }

    const { response } = error as ErrorResponse;
    if (!response || typeof response !== "object") {
        return null;
    }

    const { data } = response;
    if (!data || typeof data !== "object") {
        return null;
    }

    const normalized: Record<string, string[]> = {};

    // Обработка ошибок из data.errors
    const rawErrors = data.errors;
    if (rawErrors && typeof rawErrors === "object") {
        Object.entries(rawErrors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                const messages = value
                    .filter((message): message is string => typeof message === "string")
                    .map(translateMessage);

                if (messages.length > 0) {
                    normalized[key] = messages;
                }
            }
        });
    }

    // Обработка ошибки из data.message (например, auth.failed)
    if (data.message && typeof data.message === "string") {
        const translatedMessage = translateMessage(data.message);
        
        // Если это ошибка авторизации, добавляем её к полю email
        if (data.message.startsWith("auth.")) {
            normalized.email = [translatedMessage];
        }
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}
