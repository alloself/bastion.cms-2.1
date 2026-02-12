import { client } from '@/ts/shared/api/client'
import { isObject } from 'lodash'

import type {
    IBaseEntity,
    IBaseTreeEntity,
    IInfiniteQueryData,
    IModule,
    IServerDataList,
    ISortBy,
    TUUID,
} from '@/ts/shared/types'
import type { TAuditModelWithResolved } from '@/ts/shared/types'

export interface IAuditsQueryParams {
    page: number
    perPage: number
    search?: string
}

export const getAuditsQuery = async (
    model: string,
    entityId: string,
    params: IAuditsQueryParams,
) => {
    const { data } = await client.get<IServerDataList<TAuditModelWithResolved>>('/api/admin/audits', {
        params: {
            model,
            id: entityId,
            page: params.page,
            per_page: params.perPage,
            ...(params.search && { search: params.search.trim() }),
        },
    })
    return data
}

export interface IModuleListQueryParams {
    page: number
    perPage: number
    sortBy?: ISortBy[]
    search?: string
}

const buildListRequestParams = (
    module: Pick<IModule<IBaseEntity>, 'key' | 'relations'>,
    queryParams: IModuleListQueryParams,
) => {
    const params: Record<string, unknown> = {
        page: queryParams.page.toString(),
        per_page: queryParams.perPage.toString(),
    }

    if (queryParams.sortBy && queryParams.sortBy.length) {
        params['sortBy[]'] = queryParams.sortBy.map((sort) => `${sort.key}:${sort.order}`)
    }

    if (queryParams.search && queryParams.search.trim() !== '') {
        params.search = queryParams.search.trim()
    }

    if (module.relations?.list && module.relations.list.length) {
        params.relations = module.relations.list.join(',')
    }

    return params
}

export const getModuleListQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    queryParams: IModuleListQueryParams,
) => {
    const { data } = await client.get<IServerDataList<T>>(`/api/admin/${module.key}`, {
        params: buildListRequestParams(module, queryParams),
    })
    return data
}

export const getModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID,
) => {
    const url = `/api/admin/${module.key}/${id}`
    const { data } = await client.get<T>(url, {
        params: {
            relations: module.relations?.detail?.join(','),
        },
    })
    return data
}

export const createModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    payload: Partial<T>,
) => {
    const url = `/api/admin/${module.key}`
    const { data } = await client.post<T>(url, payload, {
        params: {
            relations: module.relations?.detail?.join(','),
        },
    })
    return data
}

export const updateModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID,
    payload: Partial<T>,
) => {
    const url = `/api/admin/${module.key}/${id}`
    const { data } = await client.patch<T>(url, payload, {
        params: {
            relations: module.relations?.detail?.join(','),
        },
    })
    return data
}

export const deleteModuleDetailQuery = async <T extends IBaseEntity>(
    module: IModule<T>,
    id: TUUID,
) => {
    const url = `/api/admin/${module.key}/${id}`
    const { data } = await client.delete<T>(url)
    return data
}


export const isInfiniteQueryData = <T>(data: unknown): data is IInfiniteQueryData<T> => {
    return isObject(data) && 'pages' in data
}

export const isServerListData = <T>(data: unknown): data is IServerDataList<T> => {
    return isObject(data) && 'data' in data && 'links' in data && 'meta' in data
}

export const isBaseTreeEntityData = <T extends IBaseTreeEntity<T>>(data: unknown): data is IBaseTreeEntity<T> => {
    return isObject(data) && 'id' in data && 'has_children' in data
}