import type { IModule } from ".";
import { client } from "@/ts/shared/api/client";
import type { IBaseEntity, IServerDataList, ISortBy, TUUID } from "@/ts/shared/types";

export interface IModuleListQueryParams {
    page: number;
    perPage: number;
    sortBy?: ISortBy[];
    search?: string;
}

const buildListRequestParams = (
    module: Pick<IModule<IBaseEntity>, "key" | "relations">,
    queryParams: IModuleListQueryParams
) => {
    const params: Record<string, unknown> = {
        page: queryParams.page.toString(),
        per_page: queryParams.perPage.toString(),
    };

    if (queryParams.sortBy && queryParams.sortBy.length) {
        params["sortBy[]"] = queryParams.sortBy.map(
            (sort) => `${sort.key}:${sort.order}`
        );
    }

    if (queryParams.search && queryParams.search.trim() !== "") {
        params.search = queryParams.search.trim();
    }

    if (module.relations && module.relations.length) {
        params.relations = module.relations.join(",");
    }

    return params;
};

export const getModuleListQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    queryParams: IModuleListQueryParams
) => {
    const { data } = await client.get<IServerDataList<T>>(
        `/api/admin/${module.key}`,
        {
            params: buildListRequestParams(module, queryParams),
        }
    );
    return data;
};

export const getModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID
) => {
    const url = `/api/admin/${module.key}/${id}`;
    const { data } = await client.get<T>(url,{
        params: {
            relations: module.relations?.join(","),
        },
    });
    return data;
};

export const createModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    payload: Partial<T>
) => {
    const url = `/api/admin/${module.key}`;
    const { data } = await client.post<T>(url, payload);
    return data;
};

export const updateModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID,
    data: Partial<T>
) => {
    const url = `/api/admin/${module.key}/${id}`;
    const { data: updatedData } = await client.patch<T>(url, data);
    return updatedData;
};

export const deleteModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID
) => {
    const url = `/api/admin/${module.key}/${id}`;
    const { data } = await client.delete<T>(url);
    return data;
};
