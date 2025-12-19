<template>
    <div
        class="b-code-editor"
        :class="{
            'b-code-editor--has-errors': normalizedErrorMessages.length > 0,
            'b-code-editor--readonly': readonly,
        }"
    >
        <label v-if="label" class="b-code-editor__label">
            {{ label }}
        </label>

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
                v-for="(errorMessage, errorMessageIndex) in normalizedErrorMessages"
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
    type CSSProperties,
} from "vue";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";

import editorWorkerUrl from "monaco-editor/esm/vs/editor/editor.worker?worker&url";
import htmlWorkerUrl from "monaco-editor/esm/vs/language/html/html.worker?worker&url";
import cssWorkerUrl from "monaco-editor/esm/vs/language/css/css.worker?worker&url";
import jsonWorkerUrl from "monaco-editor/esm/vs/language/json/json.worker?worker&url";
import tsWorkerUrl from "monaco-editor/esm/vs/language/typescript/ts.worker?worker&url";

type TMonacoEnvironment = {
    getWorker: (workerId: string, label: string) => Worker;
};

declare global {
    interface GlobalThis {
        MonacoEnvironment?: TMonacoEnvironment;
    }
}

type TCodeEditorErrorMessages = string | string[] | undefined;

type TCodeEditorOptions = Partial<monaco.editor.IStandaloneEditorConstructionOptions>;

type TCodeEditorProps = {
    modelValue?: string;
    name?: string;
    label?: string;
    height?: string;
    readonly?: boolean;
    loading?: boolean;
    errorMessages?: TCodeEditorErrorMessages;
    options?: TCodeEditorOptions;
};

const props = withDefaults(defineProps<TCodeEditorProps>(), {
    modelValue: "",
    height: "320px",
    readonly: false,
    loading: false,
    options: () => ({}),
});

const emits = defineEmits<{
    "update:modelValue": [value: string];
}>();

const editorContainer = useTemplateRef<HTMLDivElement>("editorContainer");
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
);
const resizeObserver = shallowRef<ResizeObserver | null>(null);

let isApplyingExternalValue = false;

const normalizedErrorMessages = computed<string[]>(() => {
    const { errorMessages } = props;
    if (!errorMessages) {
        return [];
    }
    if (Array.isArray(errorMessages)) {
        return errorMessages;
    }
    return [errorMessages];
});

const containerStyle = computed<CSSProperties>(() => {
    return {
        height: props.height,
    };
});

const workerBlobUrlByModuleUrl = new Map<string, string>();

const createModuleWorker = (moduleUrl: string, label: string): Worker => {
    if (!import.meta.env.DEV) {
        return new Worker(moduleUrl, { name: label, type: "module" });
    }

    const cachedBlobUrl = workerBlobUrlByModuleUrl.get(moduleUrl);
    if (cachedBlobUrl) {
        return new Worker(cachedBlobUrl, { name: label, type: "module" });
    }

    const workerSource = `import ${JSON.stringify(moduleUrl)};`;
    const workerBlob = new Blob([workerSource], {
        type: "text/javascript",
    });
    const createdBlobUrl = URL.createObjectURL(workerBlob);
    workerBlobUrlByModuleUrl.set(moduleUrl, createdBlobUrl);

    return new Worker(createdBlobUrl, { name: label, type: "module" });
};

const ensureMonacoWorkers = () => {
    if (globalThis.MonacoEnvironment?.getWorker) {
        return;
    }

    globalThis.MonacoEnvironment = {
        getWorker(workerId: string, label: string) {
            void workerId;

            if (label === "json") {
                return createModuleWorker(jsonWorkerUrl, label);
            }

            if (label === "css" || label === "scss" || label === "less") {
                return createModuleWorker(cssWorkerUrl, label);
            }

            if (
                label === "html" ||
                label === "handlebars" ||
                label === "razor"
            ) {
                return createModuleWorker(htmlWorkerUrl, label);
            }

            if (label === "typescript" || label === "javascript") {
                return createModuleWorker(tsWorkerUrl, label);
            }

            return createModuleWorker(editorWorkerUrl, label);
        },
    };
};

const resolveModelValue = (value: string | undefined): string => {
    if (typeof value !== "string") {
        return "";
    }
    return value;
};

const createEditor = (containerElement: HTMLDivElement) => {
    ensureMonacoWorkers();

    const initialValue = resolveModelValue(props.modelValue);

    const createdEditor = monaco.editor.create(containerElement, {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
        ...props.options,
        value: initialValue,
        language: "html",
        theme: "vs-dark",
        readOnly: props.readonly,
    });

    editorInstance.value = createdEditor;

    createdEditor.onDidChangeModelContent(() => {
        if (isApplyingExternalValue) {
            return;
        }

        const nextValue = createdEditor.getValue();
        if (nextValue !== props.modelValue) {
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
    () => props.modelValue,
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
    () => props.readonly,
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
    () => props.options,
    (nextOptions) => {
        const currentEditor = editorInstance.value;
        if (!currentEditor) {
            return;
        }
        currentEditor.updateOptions({
            ...nextOptions,
            readOnly: props.readonly,
        });
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.b-code-editor {
    width: 100%;
    display: flex;
    flex-direction: column;

    &__label {
        font-size: 0.875rem;
        opacity: 0.85;
        margin-bottom: 8px;
    }

    &__container {
        width: 100%;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        overflow: hidden;
    }

    &__editor {
        width: 100%;
        height: 100%;
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