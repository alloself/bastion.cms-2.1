import type { FormContext, GenericObject } from "vee-validate";
import type { Component, StyleValue } from "vue";
import type { PartialDeep } from "type-fest";

export type TClassValue = string | string[] | Record<string, boolean>;

export interface ISmartFormLayoutConfig {
    type?: "column" | "grid";
    columns?: string;
    minColumnWidth?: string;
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    autoRows?: string;
    alignItems?: string;
    justifyItems?: string;
    class?: TClassValue;
    style?: StyleValue;
}

export interface ISmartFormField {
    component: Component | string;
    key: string;
    props?: Record<string, unknown>;
    events?: Record<string, Function>;
    rule?: unknown;
    readonly?: boolean;
    wrapperClass?: TClassValue;
    wrapperStyle?: StyleValue;
    wrapperAttrs?: Record<string, unknown>;
}

export interface ISmartFormProps<
    TValues extends GenericObject,
    TOutput extends GenericObject
> {
    fields: ISmartFormField[];
    form?: FormContext<TValues, TOutput>;
    initialValues?: PartialDeep<TValues>;
    loading?: boolean;
    readonly?: boolean;
    initialItems?: Record<string, unknown>;
    layout?: ISmartFormLayoutConfig;
}

export interface IBaseEntity extends Record<string, unknown> {
    id: string;
}

export interface IServerDataList<T> {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: T[];
    sortBy?: Array<Record<string, string>>;
    search?: string;
}

export interface ITableProps {
    page: number;
    itemsPerPage: number;
    sortBy: ISortBy[];
    search: string;
}

export interface ISortBy {
    key: string;
    order: "asc" | "desc";
}
