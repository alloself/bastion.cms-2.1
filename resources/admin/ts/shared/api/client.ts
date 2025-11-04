import axios from "axios";
import { setupInterceptors, handleAuthError, handleErrorNotifications } from "./interceptors";

export const client = axios.create({
    baseURL: `/`,
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: {
        Accept: "application/json",
    },
});

setupInterceptors(client, {
    error: [handleAuthError, handleErrorNotifications],
});

export const getCSRFToken = async () => {
    await client.get("/sanctum/csrf-cookie");
};
