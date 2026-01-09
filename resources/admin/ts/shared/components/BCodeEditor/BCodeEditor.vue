<template>
    <div
        class="b-code-editor"
        :class="{
            'b-code-editor--has-errors': normalizedErrorMessages.length > 0,
            'b-code-editor--readonly': readonly,
        }"
    >
        <div class="b-code-editor__container" :style="containerStyle">
            <div ref="editorContainer" class="b-code-editor__editor"></div>

            <div
                v-if="loading"
                class="b-code-editor__loading"
                aria-hidden="true"
            >
                <div class="b-code-editor__spinner"></div>
            </div>
        </div>

        <ul
            v-if="normalizedErrorMessages.length > 0"
            class="b-code-editor__errors"
        >
            <li
                v-for="(
                    errorMessage, errorMessageIndex
                ) in normalizedErrorMessages"
                :key="errorMessageIndex"
                class="b-code-editor__error"
            >
                {{ errorMessage }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
    useTemplateRef,
} from "vue";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";

import { useMonacoEnvironment } from "./useMonacoEnvironment";
import type { TBCodeEditorProps } from "./BCodeEditor.types";

const {
    modelValue = "",
    height,
    readonly = false,
    loading = false,
    errorMessages,
    options = {},
} = defineProps<TBCodeEditorProps>();

const emits = defineEmits<{
    "update:modelValue": [value: string];
}>();

const editorContainer = useTemplateRef<HTMLDivElement>("editorContainer");
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
);
const resizeObserver = shallowRef<ResizeObserver | null>(null);

let isApplyingExternalValue = false;

const { ensureMonacoEnvironment } = useMonacoEnvironment(true);

const normalizedErrorMessages = computed<string[]>(() => {
    if (!errorMessages) {
        return [];
    }
    if (Array.isArray(errorMessages)) {
        return errorMessages;
    }
    return [errorMessages];
});

const containerStyle = computed<Record<string, string> | undefined>(() => {
    if (typeof height !== "string") {
        return undefined;
    }

    const trimmedHeight = height.trim();
    if (trimmedHeight === "") {
        return undefined;
    }

    return {
        minHeight: trimmedHeight,
    };
});

const resolveModelValue = (value: string | undefined): string => {
    if (typeof value !== "string") {
        return "";
    }
    return value;
};

const createEditor = (containerElement: HTMLDivElement) => {
    ensureMonacoEnvironment();

    const initialValue = resolveModelValue(modelValue);

    const createdEditor = monaco.editor.create(containerElement, {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
        ...options,
        value: initialValue,
        language: "html",
        theme: "vs-dark",
        readOnly: readonly,
    });

    editorInstance.value = createdEditor;

    createdEditor.onDidChangeModelContent(() => {
        if (isApplyingExternalValue) {
            return;
        }

        const nextValue = createdEditor.getValue();
        if (nextValue !== modelValue) {
            emits("update:modelValue", nextValue);
        }
    });

    const observer = new ResizeObserver(() => {
        createdEditor.layout();
    });

    observer.observe(containerElement);
    resizeObserver.value = observer;
};

const destroyEditor = () => {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;

    editorInstance.value?.dispose();
    editorInstance.value = null;
};

onMounted(() => {
    const containerElement = editorContainer.value;
    if (!containerElement) {
        return;
    }
    createEditor(containerElement);
});

onBeforeUnmount(() => {
    destroyEditor();
});

watch(
    () => modelValue,
    (nextModelValue) => {
        const currentEditor = editorInstance.value;
        if (!currentEditor) {
            return;
        }

        const nextValue = resolveModelValue(nextModelValue);
        const currentValue = currentEditor.getValue();

        if (nextValue === currentValue) {
            return;
        }

        isApplyingExternalValue = true;
        currentEditor.setValue(nextValue);
        isApplyingExternalValue = false;
    }
);

watch(
    () => readonly,
    (isReadonly) => {
        const currentEditor = editorInstance.value;
        if (!currentEditor) {
            return;
        }
        currentEditor.updateOptions({
            readOnly: isReadonly,
        });
    }
);

watch(
    () => options,
    (nextOptions) => {
        const currentEditor = editorInstance.value;
        if (!currentEditor) {
            return;
        }
        currentEditor.updateOptions({
            ...nextOptions,
            readOnly: readonly,
        });
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.b-code-editor {
    width: 100%;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;

    &__container {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.12);
      
        display: flex;
        flex-direction: column;
    }

    &__editor {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
    }

    &__loading {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    &__spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: rgba(255, 255, 255, 0.95);
        animation: b-code-editor-spin 0.85s linear infinite;
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
        .b-code-editor__container {
            border-color: rgb(var(--v-theme-error));
        }
    }
}

@keyframes b-code-editor-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>