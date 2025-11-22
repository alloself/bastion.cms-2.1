import type {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

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