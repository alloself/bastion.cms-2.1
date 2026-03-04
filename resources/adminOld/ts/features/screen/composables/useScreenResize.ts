import { unrefElement, useEventListener } from "@vueuse/core";
import {
    computed,
    onScopeDispose,
    ref,
    toValue,
    type ComponentPublicInstance,
    type MaybeRefOrGetter,
} from "vue";
import { useScreenStore } from "../store";
import type { IScreen } from "../types";
import type { TUUID } from "@/ts/shared/types";

type TResizeSession = {
    pointerId: number;
    startClientX: number;
    startScreenWidthPercent: number;
    startNextScreenWidthPercent: number;
    containerWidthPx: number;
    screenId: TUUID;
    nextScreenId: TUUID;
};

type TUseScreenResizeOptions = {
    minScreenWidthPercent?: number;
};

type TUseScreenResizeParams = {
    screen: MaybeRefOrGetter<IScreen>;
    nextScreen: MaybeRefOrGetter<IScreen | undefined>;
    screenCardRef: MaybeRefOrGetter<
        ComponentPublicInstance | HTMLElement | SVGElement | null | undefined
    >;
    options?: MaybeRefOrGetter<TUseScreenResizeOptions | undefined>;
};

const getEffectiveMinWidthPercent = (
    totalWidthPercent: number,
    minWidthPercent: number
): number => {
    if (totalWidthPercent <= 0) {
        return 0;
    }
    return Math.min(minWidthPercent, totalWidthPercent / 2);
};

const clamp = (value: number, min: number, max: number): number => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};

const setBodyStyle = (
    propertyName: "cursor" | "userSelect",
    value: string
): string => {
    const previousValue = document.body.style[propertyName];
    document.body.style[propertyName] = value;
    return previousValue;
};

export const useScreenResize = (
    params: MaybeRefOrGetter<TUseScreenResizeParams>
) => {
    const screenStore = useScreenStore();

    const isDragging = ref(false);
    const resizeSession = ref<TResizeSession | null>(null);
    const capturedElement = ref<Element | null>(null);

    const previousBodyCursor = ref<string | null>(null);
    const previousBodyUserSelect = ref<string | null>(null);

    const getParams = (): TUseScreenResizeParams => {
        return toValue(params);
    };

    const minScreenWidthPercent = computed(() => {
        const optionsValue = toValue(getParams().options);
        return optionsValue?.minScreenWidthPercent ?? 10;
    });

    const endResize = () => {
        if (capturedElement.value && resizeSession.value) {
            capturedElement.value.releasePointerCapture(
                resizeSession.value.pointerId
            );
        }

        capturedElement.value = null;
        resizeSession.value = null;
        isDragging.value = false;

        if (previousBodyCursor.value !== null) {
            document.body.style.cursor = previousBodyCursor.value;
            previousBodyCursor.value = null;
        }

        if (previousBodyUserSelect.value !== null) {
            document.body.style.userSelect = previousBodyUserSelect.value;
            previousBodyUserSelect.value = null;
        }
    };

    const startResize = (event: PointerEvent, nextScreenValue: IScreen) => {
        const screenValue = toValue(getParams().screen);
        const screenWidthPercent = screenValue.width;

        if (screenWidthPercent <= 0) {
            return;
        }

        const screenElement = unrefElement(toValue(getParams().screenCardRef));
        if (!screenElement) {
            return;
        }

        const screenWidthPx = screenElement.getBoundingClientRect().width;
        if (screenWidthPx <= 0) {
            return;
        }

        const containerWidthPx = (screenWidthPx * 100) / screenWidthPercent;
        if (!Number.isFinite(containerWidthPx) || containerWidthPx <= 0) {
            return;
        }

        resizeSession.value = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startScreenWidthPercent: screenValue.width,
            startNextScreenWidthPercent: nextScreenValue.width,
            containerWidthPx,
            screenId: screenValue.id,
            nextScreenId: nextScreenValue.id,
        };

        isDragging.value = true;

        previousBodyCursor.value = setBodyStyle("cursor", "col-resize");
        previousBodyUserSelect.value = setBodyStyle("userSelect", "none");

        if (event.currentTarget instanceof Element) {
            capturedElement.value = event.currentTarget;
            event.currentTarget.setPointerCapture(event.pointerId);
        }
    };

    const handleResizerPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const nextScreenValue = toValue(getParams().nextScreen);
        if (!nextScreenValue) {
            return;
        }

        event.preventDefault();
        startResize(event, nextScreenValue);
    };

    useEventListener(
        window,
        "pointermove",
        (event: PointerEvent) => {
            const currentSession = resizeSession.value;
            if (!currentSession || !isDragging.value) {
                return;
            }
            if (event.pointerId !== currentSession.pointerId) {
                return;
            }

            const deltaX = event.clientX - currentSession.startClientX;
            const rawDeltaPercent =
                (deltaX / currentSession.containerWidthPx) * 100;

            const totalWidthPercent =
                currentSession.startScreenWidthPercent +
                currentSession.startNextScreenWidthPercent;

            const effectiveMinWidthPercent = getEffectiveMinWidthPercent(
                totalWidthPercent,
                minScreenWidthPercent.value
            );

            const minScreenWidth = effectiveMinWidthPercent;
            const maxScreenWidth = totalWidthPercent - effectiveMinWidthPercent;

            const nextScreenWidth = clamp(
                currentSession.startScreenWidthPercent + rawDeltaPercent,
                minScreenWidth,
                maxScreenWidth
            );

            const deltaPercent =
                nextScreenWidth - currentSession.startScreenWidthPercent;

            screenStore.resizeScreens(
                currentSession.screenId,
                currentSession.nextScreenId,
                deltaPercent,
                currentSession.startScreenWidthPercent,
                currentSession.startNextScreenWidthPercent
            );
        },
        { passive: true }
    );

    useEventListener(window, "pointerup", (event: PointerEvent) => {
        if (resizeSession.value?.pointerId !== event.pointerId) {
            return;
        }
        endResize();
    });

    useEventListener(window, "pointercancel", (event: PointerEvent) => {
        if (resizeSession.value?.pointerId !== event.pointerId) {
            return;
        }
        endResize();
    });

    useEventListener(window, "blur", () => {
        if (!isDragging.value) {
            return;
        }
        endResize();
    });

    onScopeDispose(() => {
        endResize();
    });

    return { isDragging, handleResizerPointerDown };
};

