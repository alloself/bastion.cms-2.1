import { useGlobalKeydown } from "./useGlobalEvents";

interface IHotkeyOptions {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

const buildHotkeyKey = (code: string, options: IHotkeyOptions) => {
    const modifiers: Array<string> = [];

    if (options.ctrl) {
        modifiers.push("ctrl");
    }
    if (options.shift) {
        modifiers.push("shift");
    }
    if (options.alt) {
        modifiers.push("alt");
    }
    if (options.meta) {
        modifiers.push("meta");
    }

    modifiers.push(code);

    return modifiers.join("+");
};

const matchesHotkey = (
    event: KeyboardEvent,
    code: string,
    options: IHotkeyOptions
) => {
    if (event.code !== code) {
        return false;
    }

    if (options.ctrl && !event.ctrlKey) {
        return false;
    }
    if (options.shift && !event.shiftKey) {
        return false;
    }
    if (options.alt && !event.altKey) {
        return false;
    }
    if (options.meta && !event.metaKey) {
        return false;
    }

    return true;
};

export const useGlobalHotkey = (
    code: string,
    handler: () => void,
    options: IHotkeyOptions = {}
) => {
    const hotkeyKey = buildHotkeyKey(code, options);

    useGlobalKeydown(
        (event) => {
            if (matchesHotkey(event, code, options)) {
                event.preventDefault();
                handler();
            }
        },
        { key: hotkeyKey }
    );
};
