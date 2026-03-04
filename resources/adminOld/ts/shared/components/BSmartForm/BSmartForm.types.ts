import type { Component } from "vue";
import type { FormContext, GenericObject } from "vee-validate";
import type { PartialDeep } from "type-fest";
import type { z } from "zod";

export type TDynamicPropValue<TValue = unknown> = (
    formValues: GenericObject
) => TValue;

export type TFieldProps = Record<string, unknown | TDynamicPropValue>;

export interface IBSmartFormField {
    component: Component | string;
    key: string;
    props?: TFieldProps;
    events?: Record<string, Function>;
    rule?: z.ZodType;
    readonly?: boolean;
    isGrow?: boolean;
}

export type TBSmartFormProps<
    T extends GenericObject,
    K extends GenericObject,
> = {
    fields: IBSmartFormField[];
    form?: FormContext<T, K>;
    initialValues?: PartialDeep<T>;
    loading?: boolean;
    readonly?: boolean;
    layout?: string;
    initialItems?: Record<string, unknown>;
};
