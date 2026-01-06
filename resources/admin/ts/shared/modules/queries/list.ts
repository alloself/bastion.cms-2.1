import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { IModule } from "..";
import type { IBaseEntity } from "../../types";
import { useQuery } from "@pinia/colada";
import { getModuleListQuery, type IModuleListQueryParams } from "../api";

export const useModuleListQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    queryParams: MaybeRefOrGetter<IModuleListQueryParams>
) => {
    const moduleValue = toValue(module);

    const key = computed(() => ["list", moduleValue.key, toValue(queryParams)]);

    const listQuery = useQuery({
        key,
        query: () => getModuleListQuery(moduleValue, toValue(queryParams)),
    });

    return listQuery;
};
