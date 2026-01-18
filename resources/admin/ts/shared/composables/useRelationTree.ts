import { useQueryCache } from '@pinia/colada'

import { client } from '@/ts/shared/api/client'
import type { IBaseTreeEntity } from '@/ts/shared/types'

const fetchTreeChildren = async <T extends IBaseTreeEntity>(
    endpoint: string,
    parentId: string,
    relations: string[],
) => {
    const params: Record<string, string> = {}

    if (relations.length) {
        params.relations = relations.join(',')
    }

    const url = `/api/admin/${endpoint}/${parentId}/children`
    const { data } = await client.get<T[]>(url, { params })

    return data
}

export const useFetchRelationTreeChildren = () => {
    const queryCache = useQueryCache()

    const fetchChildren = async <T extends IBaseTreeEntity>(
        endpoint: string,
        parentId: string,
        relations: string[],
    ) => {
        const queryKey = ['tree-children', endpoint, parentId, relations]

        const entry = queryCache.ensure({
            key: queryKey,
            query: () => fetchTreeChildren<T>(endpoint, parentId, relations),
        })

        await queryCache.refresh(entry)

        return queryCache.getQueryData<T[]>(queryKey) ?? []
    }

    return { fetchChildren }
}
