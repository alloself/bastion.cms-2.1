import type { IModule } from ".";
import { client } from "../api/client";
import type { IBaseEntity, IServerDataList, ISortBy } from "../types";

export interface IModuleListQueryParams {
    page: number;
    perPage: number;
    sortBy?: ISortBy[];
    search?: string;
}

const buildQueryString = (params: IModuleListQueryParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("per_page", params.perPage.toString());

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

export const getModuleListQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    params: IModuleListQueryParams
) => {
    const url = `/api/admin/${module.key}?${buildQueryString(params)}`;
    const { data } = await client.get<IServerDataList<T>>(url);
    return data;
};
