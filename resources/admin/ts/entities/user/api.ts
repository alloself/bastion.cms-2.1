import { client } from "@admin/ts/shared/api/client";
import type { User } from "@shared/types/models";
import { defineQueryOptions } from "@pinia/colada";
import { userQueryKeys } from "@admin/ts/entities/user/const";
import type { LoginFormValues } from "@admin/ts/shared/forms/login";

export const getMe = async (): Promise<User> => {
    const { data } = await client.get<User>("/api/admin/me");
    return data;
};

export const login = async (payload: LoginFormValues): Promise<void> => {
    await client.post("/login", payload);
};

export const logout = async (): Promise<void> => {
    await client.post("/logout");
};

export const userMeQuery = defineQueryOptions({
    key: userQueryKeys.me,
    query: getMe,
    staleTime: 300_000,
});
