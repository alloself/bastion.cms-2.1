import { defineStore } from "pinia";
import { ref } from "vue";
import type { IScreen } from "./types";

export const useScreenStore = defineStore("screen", () => {
    const screens = ref<IScreen[]>([]);

    return {
        screens,
    };
});
