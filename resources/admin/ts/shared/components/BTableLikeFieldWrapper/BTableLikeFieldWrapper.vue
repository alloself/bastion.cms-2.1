<template>
    <div
        class="b-table-like-field-wrapper"
        :class="{
            'b-table-like-field-wrapper--has-errors': hasErrors,
            'b-table-like-field-wrapper--readonly': readonly,
        }"
    >
        <div class="b-table-like-field-wrapper__container">
            <div v-if="label" class="b-table-like-field-wrapper__label">
                <VIcon
                    v-if="labelIcon"
                    size="small"
                    :icon="labelIcon"
                    class="mr-2"
                />
                <span>{{ label }}</span>
            </div>

            <div class="b-table-like-field-wrapper__content">
                <slot />
            </div>

            <div
                v-if="hasActionsSlot"
                class="b-table-like-field-wrapper__actions"
            >
                <slot name="actions" />
            </div>
        </div>

        <ul
            v-if="errorMessages?.length"
            class="b-table-like-field-wrapper__errors"
        >
            <li
                v-for="(errorMessage, errorMessageIndex) in errorMessages"
                :key="errorMessageIndex"
                class="b-table-like-field-wrapper__error"
            >
                {{ errorMessage }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

defineProps<{
    label?: string;
    labelIcon?: string;
    readonly?: boolean;
    hasErrors?: boolean;
    errorMessages?: string[];
}>();

defineSlots<{
    default(): unknown;
    actions(): unknown;
}>();

const slots = useSlots();

const hasActionsSlot = computed(() => !!slots.actions);
</script>

<style scoped lang="scss">
.b-table-like-field-wrapper {
    width: 100%;

    &__container {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        overflow: hidden;
    }

    &__label {
        padding: 8px 16px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
    }

    &__content {
        max-height: 300px;
        overflow: auto;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    &__errors {
        margin: 8px 0 0;
        padding: 0;
        list-style: none;
        color: rgb(var(--v-theme-error));
        font-size: 0.75rem;
    }

    &__error {
        margin: 2px 0 0;
    }

    &--has-errors {
        .b-table-like-field-wrapper__container {
            border-color: rgb(var(--v-theme-error));
        }
    }
}
</style>
