import { client } from "@admin/ts/shared/api/client";
import type { IBaseEntity, IServerDataList, ISortBy } from "../../types";

export interface IModuleListQueryParams {
    page: number;
    per_page: number;
    sortBy?: ISortBy[];
    search?: string;
}

const buildQueryString = (params: IModuleListQueryParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("per_page", params.per_page.toString());

    if (params.sortBy && params.sortBy.length > 0) {
        params.sortBy.forEach((sort) => {
            searchParams.append("sortBy[]", `${sort.key}:${sort.order}`);
        });
    }

    if (params.search && params.search.trim() !== "") {
        searchParams.set("search", params.search);
    }

    return searchParams.toString();
};

export const getModuleList = async <T extends IBaseEntity>(
    baseUrl: string,
    params: IModuleListQueryParams
) => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    const { data } = await client.get<IServerDataList<T>>(url);
    return data;
};

export const getModuleEntity = async <T extends IBaseEntity>(
    baseUrl: string,
    id: string
) => {
    const { data } = await client.get<T>(`${baseUrl}/${id}`);
    return data;
};

export const createModuleEntity = async <T extends IBaseEntity>(
    baseUrl: string,
    payload: Partial<T>
) => {
    const { data } = await client.post<T>(baseUrl, payload);
    return data;
};

export const updateModuleEntity = async <T extends IBaseEntity>(
    baseUrl: string,
    id: string,
    payload:  Partial<T>
) => {
    const { data } = await client.put<T>(`${baseUrl}/${id}`, payload);
    return data;
};

export const deleteModuleEntity = async (baseUrl: string, id: string) => {
    await client.delete(`${baseUrl}/${id}`);
};

