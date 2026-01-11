import { toValue, type MaybeRefOrGetter } from "vue";
import type { IModule } from "..";
import type { IBaseEntity } from "@/ts/shared/types";
import { useQuery } from "@pinia/colada";
import { getModuleListQuery, type IModuleListQueryParams } from "../api";

export const useModuleListQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    queryParams: MaybeRefOrGetter<IModuleListQueryParams>
) => {
    const moduleValue = toValue(module);
    const queryParamsValue = toValue(queryParams);

    const listQuery = useQuery({
        key: () => ["list", moduleValue.key, queryParamsValue],
        query: () => getModuleListQuery(moduleValue, queryParamsValue),
    });

    return listQuery;
};
