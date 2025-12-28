import { toValue, type MaybeRefOrGetter } from "vue";
import type { IModule } from "..";
import type { IBaseEntity } from "../../types";
import { useQuery } from "@pinia/colada";
import { getModuleListQuery, type IModuleListQueryParams } from "../api";

export const useModuleListQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    queryParams: MaybeRefOrGetter<IModuleListQueryParams>
) => {
    const moduleValue = toValue(module);
    const queryParamsValue = toValue(queryParams);

    const listQuery = useQuery({
        key: ["list", module, queryParams],
        query: () => getModuleListQuery(moduleValue, queryParamsValue),
    });

    return listQuery;
};
