import type { User } from "@/shared/types/models";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);

    const login = async (email: string, password: string) => {};

    return {
        user,
        login,
    };
});
