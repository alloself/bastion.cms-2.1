import type { FormContext, GenericObject } from "vee-validate";
import type { Component, StyleValue } from "vue";
import type { PartialDeep } from "type-fest";
import type { z } from "zod";

export type TClassValue = string | string[] | Record<string, boolean>;

export interface ISmartFormLayoutConfig {
    type?: "column" | "grid";
    columns?: string;
    minColumnWidth?: string;
    areas?: string[];
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
    rule?: z.ZodType;
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
    id?: string;
}

export interface IServerDataList<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
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

export interface IVuetifyTableOptions {
    page: number;
    itemsPerPage: number;
    sortBy: ISortBy[];
    groupBy: string[];
    search?: string;
}

export interface IModuleListParams {
    page: number;
    perPage: number;
    sortBy: ISortBy[];
    search: string;
}

export interface ITableHeader {
    title: string;
    key: string;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    width?: string | number;
    minWidth?: string;
    maxWidth?: string;
}

export interface IDeleteDialogState {
    isOpen: boolean;
    entityId: string | null;
    entityIds: string[];
    isBatch: boolean;
}
