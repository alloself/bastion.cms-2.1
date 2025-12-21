import type { Component } from "vue";
import type z from "zod";

export interface IBaseEntity {
    id?: string;
}

export interface ISmartFormField {
    component: Component | string;
    key: string;
    props?: Record<string, unknown>;
    events?: Record<string, Function>;
    rule?: z.ZodType;
    readonly?: boolean;
}

export interface ITableHeader {
    title: string;
    key: string;
    sortable?: boolean;
}
