import { useMutation, useQueryCache } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { client } from '@/ts/shared/api/client'
import type { IBaseTreeEntity } from '@/ts/shared/types'

interface ITreeNodeMovePayload<T extends IBaseTreeEntity> {
    nodeId: string
    nodeData: T
    parentId: string | null
}

const patchTreeNodeParent = async <T extends IBaseTreeEntity>(
    moduleKey: string,
    payload: ITreeNodeMovePayload<T>,
) => {
    const url = `/api/admin/${moduleKey}/${payload.nodeId}`
    const { data } = await client.patch<T>(url, {
        ...payload.nodeData,
        parent_id: payload.parentId,
    })

    return data
}

export const useTreeNodeMove = <T extends IBaseTreeEntity>(
    moduleKey: MaybeRefOrGetter<string>,
) => {
    const queryCache = useQueryCache()

    const moveMutation = useMutation({
        mutation: (payload: ITreeNodeMovePayload<T>) =>
            patchTreeNodeParent<T>(toValue(moduleKey), payload),
        onSettled: (_updatedNode, error, payload) => {
            if (error) {
                return
            }

            const moduleKeyValue = toValue(moduleKey)
            const oldParentId = payload.nodeData.parent_id
            const newParentId = payload.parentId

            if (oldParentId) {
                queryCache.invalidateQueries({
                    key: ['tree-children', moduleKeyValue, oldParentId],
                    exact: true,
                })
            }

            if (newParentId) {
                queryCache.invalidateQueries({
                    key: ['tree-children', moduleKeyValue, newParentId],
                    exact: true,
                })
            }
        },
    })

    return { moveMutation }
}
