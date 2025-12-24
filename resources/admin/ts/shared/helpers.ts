import type { Component } from "vue";

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

export const resolveComponentExport = (value: unknown): unknown => {
    if (isRecord(value) && "default" in value) {
        return value.default;
    }
    return value;
};

export const isVueComponent = (value: unknown): value is Component => {
    return typeof value === "function" || isRecord(value);
};
