import type { RouteLocationNormalized } from "vue-router";

export const isPlainRecord = (
    value: unknown
): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isRouteLocationNormalized = (
    value: unknown
): value is RouteLocationNormalized => {
    if (!isPlainRecord(value)) {
        return false;
    }

    const nameValue = value.name;
    if (typeof nameValue !== "string" && typeof nameValue !== "symbol") {
        return false;
    }

    if (!isPlainRecord(value.params)) {
        return false;
    }

    return (
        typeof value.fullPath === "string" &&
        typeof value.path === "string" &&
        Array.isArray(value.matched)
    );
};

