import type { IBaseEntity } from '../../types'

export type TBRelationAutocompleteErrorMessages = string | string[] | undefined

export type TBRelationAutocompleteProps<T extends IBaseEntity = IBaseEntity> = {
    moduleKey: string
    itemTitle?: string
    label?: string
    placeholder?: string
    readonly?: boolean
    loading?: boolean
    errorMessages?: TBRelationAutocompleteErrorMessages
    debounceMs?: number
    relations?: string[]
    initialItems?: T[]
}
