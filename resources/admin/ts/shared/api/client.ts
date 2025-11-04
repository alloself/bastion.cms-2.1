import axios from "axios";
import { requestInterceptors, responseInterceptors } from "./interceptors";

export const client = axios.create({
    baseURL: `/`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: "application/json",
    },
});

client.interceptors.request.use(...requestInterceptors);
client.interceptors.response.use(...responseInterceptors);

export const getCSRFToken = async () => {
    await client.get("/sanctum/csrf-cookie");
};
