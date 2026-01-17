import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import { client } from "@/ts/shared/api/client";
import type { IBaseEntity, IServerDataList } from "@/ts/shared/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

interface IRelationSearchQueryParams {
    page: number;
    perPage: number;
    search: string;
    sortBy: never[];
}

const buildQueryString = (params: IRelationSearchQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("per_page", params.perPage.toString());

    if (params.search.trim() !== "") {
        searchParams.set("search", params.search);
    }

    return searchParams.toString();
};

export const useRelationSearch = <T extends IBaseEntity>(
    endpoint: MaybeRefOrGetter<string>,
    search: MaybeRefOrGetter<string>,
    relations: MaybeRefOrGetter<string[]>
) => {
    const relationsValue = toValue(relations);
    const queryParams = computed<IRelationSearchQueryParams>(() => ({
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
        search: toValue(search),
        sortBy: [],
    }));

    const key = computed(() => ["list", toValue(endpoint), queryParams.value]);

    return useQuery({
        key,
        query: async () => {
            const endpointValue = toValue(endpoint);
            const queryString = buildQueryString(queryParams.value);
            const { data } = await client.get<IServerDataList<T>>(
                `/api/admin/${endpointValue}?${queryString}`,
                {
                    params: {
                        ...queryParams.value,
                        relations: relationsValue.join(","),
                    },
                }
            );
            return data;
        },
    });
};
