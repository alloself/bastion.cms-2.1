import type { User } from "@shared/types/models";
import { client } from "@admin/ts/shared/api/client";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);

    const getUser = async () => {
        try {
            const { data } = await client.get("/api/admin/me");
            user.value = data;
        } catch (e: any) {
            throw e;
        }
    };

    const logout = async () => {
        try {
            user.value = null;
            await client.post("/logout");
        } catch (e) {
            console.log(e);
        }
    };

    const login = async (data: Record<string, any> | undefined) => {
        try {
            await client.post("/login", data);
            await getUser();
            return user.value;
        } catch (e: any) {
            return Promise.reject(e);
        }
    };

    return {
        user,
        getUser,
        logout,
        login,
    };
});
