import { type MaybeRefOrGetter, toValue, ref } from "vue";
import { useMouse, useEventListener } from "@vueuse/core";
import { useScreenStore } from "@admin/ts/features/screen/store";
import type { IScreen } from "@admin/ts/features/screen/types";

interface ResizerOptions {
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export const useScreenResizer = (
    leftScreen: MaybeRefOrGetter<IScreen>,
    rightScreen: MaybeRefOrGetter<IScreen>,
    options?: ResizerOptions
) => {
    const screenStore = useScreenStore();
    const { x: mouseX } = useMouse();
    const isDragging = ref(false);
    const startX = ref(0);
    const containerRef = ref<HTMLElement | null>(null);
    const initialLeftWidth = ref(0);
    const initialRightWidth = ref(0);

    const handleMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const leftScreenValue = toValue(leftScreen);
        const rightScreenValue = toValue(rightScreen);

        if (!leftScreenValue || !rightScreenValue) {
            return;
        }

        const dividerElement = (event.currentTarget || event.target) as HTMLElement;

        let container: HTMLElement | null = null;
        if (dividerElement) {
            container = dividerElement.closest("main") as HTMLElement;
        }
        if (!container) {
            container = document.querySelector("main") as HTMLElement;
        }
        if (!container) {
            container = document.querySelector(".v-main") as HTMLElement;
        }

        if (!container) {
            return;
        }

        containerRef.value = container;
        startX.value = event.clientX;
        initialLeftWidth.value = screenStore.getScreenWidth(leftScreenValue.id);
        initialRightWidth.value = screenStore.getScreenWidth(rightScreenValue.id);
        isDragging.value = true;

        options?.onDragStart?.();
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    useEventListener("mousemove", () => {
        if (!isDragging.value || !containerRef.value) {
            return;
        }

        const leftScreenValue = toValue(leftScreen);
        const rightScreenValue = toValue(rightScreen);

        if (!leftScreenValue || !rightScreenValue) {
            return;
        }

        const containerWidth = containerRef.value.clientWidth;
        const deltaX = mouseX.value - startX.value;
        const deltaPercent = (deltaX / containerWidth) * 100;

        const minWidthPixels = 368;
        const minWidthPercent = (minWidthPixels / containerWidth) * 100;
        const totalPairWidth = initialLeftWidth.value + initialRightWidth.value;

        let newLeftWidth = initialLeftWidth.value + deltaPercent;
        let newRightWidth = initialRightWidth.value - deltaPercent;

        if (minWidthPercent * 2 <= totalPairWidth) {
            const minLeftWidth = minWidthPercent;
            const minRightWidth = minWidthPercent;
            const maxLeftWidth = totalPairWidth - minRightWidth;

            if (newLeftWidth < minLeftWidth) {
                newLeftWidth = minLeftWidth;
            }
            if (newLeftWidth > maxLeftWidth) {
                newLeftWidth = maxLeftWidth;
            }

            newRightWidth = totalPairWidth - newLeftWidth;
        }

        if (newLeftWidth > 0 && newRightWidth > 0) {
            screenStore.setScreenWidth(leftScreenValue.id, newLeftWidth, false);
            screenStore.setScreenWidth(rightScreenValue.id, newRightWidth, false);
        }
    });

    useEventListener("mouseup", () => {
        if (!isDragging.value) {
            return;
        }

        isDragging.value = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        screenStore.normalizeScreenWidths();
        options?.onDragEnd?.();
    });

    return {
        handleMouseDown,
    };
};


