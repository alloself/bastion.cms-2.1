import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type { IScreen, TUUID } from "./types";

export const useScreenStore = defineStore("screen", () => {
    const screens = reactive<Map<TUUID, IScreen>>(new Map());
    const activeScreenId = ref<TUUID | null>(null);


    const activeScreen = computed(() => {})

    return {
        screens,
        activeScreen
    };
});
