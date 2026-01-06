export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

export const isValidRedirectPath = (value: unknown): value is string => {
    if (typeof value !== "string") {
        return false;
    }
    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("//")
    ) {
        return false;
    }
    if (!value.startsWith("/")) {
        return false;
    }
    return true;
};
