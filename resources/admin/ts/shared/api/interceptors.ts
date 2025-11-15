import type {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import router from "@admin/ts/app/router";
import { useUserStore } from "@admin/ts/entities/user";
import { useNotificationsStore } from "@admin/ts/features/notifications/store/notificationsStore";

export type RequestHandler = (
    config: InternalAxiosRequestConfig
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type ResponseHandler = (
    response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

export type ErrorHandler = (error: AxiosError) => Promise<unknown>;

export interface InterceptorHandlers {
    request?: RequestHandler[];
    response?: ResponseHandler[];
    error?: ErrorHandler[];
}

export const setupInterceptors = (
    client: AxiosInstance,
    handlers: InterceptorHandlers
): void => {
    if (handlers.request) {
        handlers.request.forEach((handler) => {
            client.interceptors.request.use(handler);
        });
    }

    if (handlers.response) {
        handlers.response.forEach((handler) => {
            client.interceptors.response.use(handler);
        });
    }

    if (handlers.error) {
        handlers.error.forEach((handler) => {
            client.interceptors.response.use(undefined, handler);
        });
    }
};

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
        "message" in error.response?.data
    ) {
        notificationsStore.pushNotification({
            content: error.response?.data.message as string,
            color: "error",
        });
        return Promise.reject(error);
    }

    return Promise.reject(error);
};