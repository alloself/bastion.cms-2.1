import { isAxiosError } from "axios";
import type { FormContext, GenericObject } from "vee-validate";
import { toValue, type MaybeRefOrGetter } from "vue";

export const useFormSubmit = <T extends GenericObject, K extends GenericObject>(
    fn: () => Promise<void>,
    form: MaybeRefOrGetter<FormContext<T, K> | undefined>
) => {
    const handler = async () => {
        const formValue = toValue(form);
        if (!formValue) {
            return;
        }
        try {
            const validationResult = await formValue.validate();
            if (!validationResult.valid) {
                return;
            }
            await fn();
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                const formErrors = error.response?.data.errors;
                if (formErrors) {
                    formValue.setErrors(formErrors);
                }
            }
        }
    };

    return { handler };
};