import { useQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue, watch } from 'vue'

import { client } from '@/ts/shared/api/client'
import type { IBaseTreeEntity } from '@/ts/shared/types'

const fetchTreeChildren = async <T extends IBaseTreeEntity>(
    moduleKey: string,
    parentId: string,
    relations: string[],
) => {
    const params: Record<string, string> = {}

    if (relations.length) {
        params.relations = relations.join(',')
    }

    const url = `/api/admin/${moduleKey}/${parentId}/children`
    const { data } = await client.get<T[]>(url, { params })

    return data
}
export const useRelationTreeQuery = <T extends IBaseTreeEntity>(
    moduleKey: MaybeRefOrGetter<string>,
    parentId: MaybeRefOrGetter<string>,
    relations: MaybeRefOrGetter<string[]>,
    onMutation?: (data: T[]) => void,
) => {
    const query = useQuery({
        key: () => ['tree-children', toValue(moduleKey), toValue(parentId), toValue(relations)],
        query: () =>
            fetchTreeChildren<T>(toValue(moduleKey), toValue(parentId), toValue(relations)),
        enabled: () => !!toValue(parentId),
    })

    watch(
        () => query.data.value,
        (data) => {
            if (!data || !onMutation) {
                return
            }

            onMutation(data)
        },
    )

    return query
}
