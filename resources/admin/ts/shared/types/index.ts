import type { FormContext, GenericObject } from "vee-validate";
import type { Component } from "vue";
import type { PartialDeep } from "type-fest";
import type { z } from "zod";

export type TClassValue = string | string[] | Record<string, boolean>;

export type TSmartFormLayout = string | string[];

export type TSmartFormGridLayout =
    | {
          isEnabled: false;
      }
    | {
          isEnabled: true;
          templateAreas: string;
          templateColumns: string;
          fieldAreaByKey: Record<string, string>;
      };

export interface ISmartFormField {
    component: Component | string;
    key: string;
    props?: Record<string, unknown>;
    events?: Record<string, Function>;
    rule?: z.ZodType;
    readonly?: boolean;
}

export interface ISmartFormProps<
    TValues extends GenericObject,
    TOutput extends GenericObject
> {
    fields: ISmartFormField[];
    layout?: TSmartFormLayout;
    form?: FormContext<TValues, TOutput>;
    initialValues?: PartialDeep<TValues>;
    loading?: boolean;
    readonly?: boolean;
    initialItems?: Record<string, unknown>;
}

export interface IBaseEntity{
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
