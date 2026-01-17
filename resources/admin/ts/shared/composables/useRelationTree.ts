import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import { client } from "@/ts/shared/api/client";
import type { IBaseTreeEntity } from "@/ts/shared/types";

export const useRelationTreeChildren = <T extends IBaseTreeEntity>(
    endpoint: MaybeRefOrGetter<string>,
    parentId: MaybeRefOrGetter<string>,
    relations: MaybeRefOrGetter<string[]>
) => {
    const key = computed(() => [
        "tree-children",
        toValue(endpoint),
        toValue(parentId),
        toValue(relations),
    ]);

    return useQuery({
        key,
        query: async () => {
            const endpointValue = toValue(endpoint);
            const parentIdValue = toValue(parentId);
            const relationsValue = toValue(relations);

            const params: Record<string, string> = {};

            if (relationsValue.length > 0) {
                params.relations = relationsValue.join(",");
            }

            const url = `/api/admin/${endpointValue}/${parentIdValue}/children`;
            const { data } = await client.get<T[]>(url, { params });

            return data;
        },
    });
};

export const fetchRelationTreeChildren = async <T extends IBaseTreeEntity>(
    endpoint: string,
    parentId: string,
    relations: string[]
) => {
    const params: Record<string, string> = {};

    if (relations.length) {
        params.relations = relations.join(",");
    }

    const url = `/api/admin/${endpoint}/${parentId}/children`;
    const { data } = await client.get<T[]>(url, { params });

    return data;
};
