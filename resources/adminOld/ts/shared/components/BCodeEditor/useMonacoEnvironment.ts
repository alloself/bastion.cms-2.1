import { toValue, type MaybeRefOrGetter } from "vue";

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

const setGlobalMonacoEnvironmentIfNeeded = () => {
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

export const useMonacoEnvironment = (isEnabled: MaybeRefOrGetter<boolean>) => {
    const ensureMonacoEnvironment = () => {
        if (!toValue(isEnabled)) {
            return;
        }
        setGlobalMonacoEnvironmentIfNeeded();
    };

    return {
        ensureMonacoEnvironment,
    };
};