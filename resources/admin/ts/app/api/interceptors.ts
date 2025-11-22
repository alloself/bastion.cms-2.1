import type { AxiosError } from "axios";
import router from "@admin/ts/app/router";
import { useUserStore } from "@admin/ts/entities/user";
import { useNotificationsStore } from "@admin/ts/features/notifications/store/notificationsStore";

export const handleAuthError = async (error: AxiosError) => {
    const userStore = useUserStore();

    if (error.response?.status === 401 || error.response?.status === 403) {
        if (userStore.user) {
            await userStore.logout();
        }
        router.push({ name: "Login" });
        return Promise.reject(error);
    }

    return Promise.reject(error);
};

export const handleUnprocessableEntityError = async (error: AxiosError) => {
    const notificationsStore = useNotificationsStore();

    if (
        error.response?.status === 422 &&
        error.response?.data &&
        typeof error.response?.data === "object" &&
        "message" in error.response?.data &&
        typeof error.response?.data.message === "string"
    ) {
        notificationsStore.pushNotification({
            content: error.response?.data.message,
            color: "error",
        });
        return Promise.reject(error);
    }

    return Promise.reject(error);
};
