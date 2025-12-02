import type { User } from "@shared/types/models";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { LoginFormValues } from "@admin/ts/shared/forms/login";
import {
    getMe,
    login as apiLogin,
    logout as apiLogout,
} from "@admin/ts/entities/user/api";

export const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);

    const isAuthenticated = computed(() => user.value !== null);

    const getUser = async () => {
        try {
            const data = await getMe();
            user.value = data ?? null;
        } catch {
            user.value = null;
        }
    };

    const logout = async () => {
        user.value = null;
        await apiLogout();
    };

    const login = async (data: LoginFormValues) => {
        try {
            await apiLogin(data);
            await getUser();
            return user.value;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    };

    return {
        user,
        isAuthenticated,
        getUser,
        logout,
        login,
    };
});
