import { useQuery } from '@pinia/colada'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type { IBaseEntity, IModule } from '@/ts/shared/types'

import { type IModuleListQueryParams, getModuleListQuery } from '../api'

export const buildListQueryKey = <T extends IBaseEntity>(
    module: IModule<T>,
    queryParams: IModuleListQueryParams,
) => {
    return ['list', module.key, JSON.stringify(queryParams)]
}

export const useModuleListQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    queryParams: MaybeRefOrGetter<IModuleListQueryParams>,
) => {
    const moduleValue = toValue(module)
    const queryParamsValue = toValue(queryParams)

    const listQuery = useQuery({
        key: () => buildListQueryKey(moduleValue, queryParamsValue),
        query: () => getModuleListQuery(moduleValue, queryParamsValue),
        gcTime:  1000 * 60 * 5,
    })

    return listQuery
}
