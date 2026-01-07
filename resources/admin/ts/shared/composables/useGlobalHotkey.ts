import { inject } from "vue";
import { useGlobalEvent } from "./useGlobalEvents";
import { ACTIVE_SCREEN_KEY } from "../const";

interface IHotkeyOptions {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

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
    const isContextActive = inject(ACTIVE_SCREEN_KEY, () => false);

    useGlobalEvent("keydown", (event) => {
        if (!(event instanceof KeyboardEvent)) {
            return;
        }

        if (!isContextActive()) {
            return;
        }

        if (matchesHotkey(event, code, options)) {
            event.preventDefault();
            handler();
        }
    });
};
