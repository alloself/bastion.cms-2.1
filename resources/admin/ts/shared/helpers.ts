export const isDev = () => {
    return import.meta.env.DEV;
};

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};
