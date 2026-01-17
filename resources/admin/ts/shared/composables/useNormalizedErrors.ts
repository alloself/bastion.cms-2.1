import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const useNormalizedErrors = (
    errorMessages: MaybeRefOrGetter<string | string[] | undefined>
) => {
    return computed(() => {
        const value = toValue(errorMessages);

        if (!value) {
            return [];
        }

        if (Array.isArray(value)) {
            return value;
        }

        return [value];
    });
}
