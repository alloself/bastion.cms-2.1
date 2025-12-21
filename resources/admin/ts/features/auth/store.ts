import { client } from "@/ts/shared";
import type { LoginFormValues } from "@/ts/shared/forms";
import type { User } from "@shared/types/models";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);

    const logout = async () => {
        user.value = null;
        await client.post("/logout");
    };

    const login = async (payload: LoginFormValues) => {
        try {
            await client.post("/login", payload);
            await getUser();
            return user.value;
        } catch (e: unknown) {
            return e;
        }
    };

    const getUser = async () => {
        try {
            const { data } = await client.get<User>("/api/admin/me");

            user.value = data ?? null;
        } catch {
            user.value = null;
        }
    };

    return {
        user,
        logout,
        getUser,
        login,
    };
});
