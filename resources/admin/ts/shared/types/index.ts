import type { ComputedRef } from "vue";
import type { QueryCache } from "@pinia/colada";
import type { PartialDeep } from "type-fest";
import type { IBSmartFormField } from "../components/BSmartForm";


export interface IBaseEntity {
    id?: string;
}

export interface IBaseTreeEntity<T extends IBaseEntity = IBaseEntity> extends IBaseEntity {
    children?: T[];
    has_children: boolean;
}

export interface ITableHeader {
    title: string;
    key: string;
    sortable?: boolean;
}

export interface IModuleForm<T extends IBaseEntity> {
    fields: ComputedRef<IBSmartFormField[]>;
    layout?: string;
    createInitialValues: () => PartialDeep<T>;
}

export interface IModule<T extends IBaseEntity = IBaseEntity> {
    key: string;
    title: string;
    icon?: string;
    to?: string;
    showInNavigation?: boolean;
    isDefault?: boolean;
    headers: ITableHeader[];
    getDetailTabTitle(entity?: T | null): string;
    createForm: (entity?: T) => IModuleForm<T>;
    relations?: {
        list?: string[];
        detail?: string[];
    };
    onEntityUpdate?: (entity: T, queryCache: QueryCache) => void;
}

export type TUUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ISortBy {
    key: string;
    order: "asc" | "desc";
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
