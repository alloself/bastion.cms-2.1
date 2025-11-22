import type { User } from "@shared/types/models";
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { LoginFormValues } from "@admin/ts/shared/forms/login";
import { useQueryCache } from "@pinia/colada";
import {
    userMeQuery,
    login as apiLogin,
    logout as apiLogout,
} from "@admin/ts/entities/user/api";
import { userQueryKeys } from "@admin/ts/entities/user/const";
import { isAxiosError } from "axios";

export const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);
    const queryCache = useQueryCache();
    const meEntry = queryCache.ensure(userMeQuery);

    watch(
        () => meEntry.state.value.data,
        (newUser) => {
            user.value = newUser ?? null;
        },
        { immediate: true }
    );

    const isAuthenticated = computed(() => user.value !== null);

    const getUser = async () => {
        try {
            const state = await queryCache.refresh(meEntry);
            user.value = state?.data ?? null;
        } catch {
            user.value = null;
        }
    };

    const logout = async () => {
        try {
            user.value = null;
            await apiLogout();
            await queryCache.cancelQueries({ key: [...userQueryKeys.me] });
            await queryCache.remove(meEntry);
        } catch (e: unknown) {
            let status: number | undefined;
            if (isAxiosError(e)) {
                status = e.response?.status;
            }

            if (status === 401 || status === 419) {
                await queryCache.cancelQueries({ key: [...userQueryKeys.me] });
                await queryCache.remove(meEntry);
            }
        }
    };

    const login = async (data: LoginFormValues) => {
        try {
            await apiLogin(data);
            await queryCache.invalidateQueries({
                key: [...userQueryKeys.me],
                exact: true,
            });
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
