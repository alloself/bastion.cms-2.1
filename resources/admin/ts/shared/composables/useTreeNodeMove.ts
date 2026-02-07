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

    const removeFromOldParentCache = (nodeId: string, oldParentId: string | null) => {
        if (!oldParentId) {
            return
        }

        const entries = queryCache.getEntries({
            key: ['tree-children', toValue(moduleKey), oldParentId],
        })

        for (const entry of entries) {
            const items = entry.state.value.data

            if (Array.isArray(items)) {
                queryCache.setQueryData(
                    entry.key,
                    items.filter((item) => item.id !== nodeId),
                )
            }
        }
    }

    const addToNewParentCache = (updatedNode: T, newParentId: string | null) => {
        if (!newParentId) {
            return
        }

        const entries = queryCache.getEntries({
            key: ['tree-children', toValue(moduleKey), newParentId],
        })

        for (const entry of entries) {
            const items = entry.state.value.data

            if (Array.isArray(items)) {
                queryCache.setQueryData(entry.key, [...items, updatedNode])
            }
        }
    }

    const moveMutation = useMutation({
        mutation: (payload: ITreeNodeMovePayload<T>) =>
            patchTreeNodeParent<T>(toValue(moduleKey), payload),
        onSuccess: (updatedNode, payload) => {
            removeFromOldParentCache(payload.nodeId, payload.nodeData.parent_id)
            addToNewParentCache(updatedNode, payload.parentId)
        },
    })

    return { moveMutation }
}
