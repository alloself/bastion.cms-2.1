import type { PartialDeep } from 'type-fest'
import type { GenericObject } from 'vee-validate'
import type { Component } from 'vue'
import type { z } from 'zod'

export interface IBSmartFormField {
    key: string
    component: Component | string
    props?: Record<string, unknown>
    events?: Record<string, Function>
    rule?: z.ZodType
    readonly?: boolean
}

export type TBSmartFormProps<T extends GenericObject> = {
    fields: IBSmartFormField[]
    initialValues?: PartialDeep<T> | null
    loading?: boolean
    readonly?: boolean
    layout?: string
    initialItems?: T[]
}
