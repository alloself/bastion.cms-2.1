import axios from "axios";
import {
    setupInterceptors,
    type InterceptorHandlers,
} from "@admin/ts/shared/api/interceptors";

export const client = axios.create({
    baseURL: `/`,
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: {
        Accept: "application/json",
    },
});

export const configureClient = (handlers: InterceptorHandlers): void => {
    setupInterceptors(client, handlers);
};

export const getCSRFToken = async () => {
    await client.get("/sanctum/csrf-cookie");
};
