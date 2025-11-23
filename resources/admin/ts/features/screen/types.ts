import type { RouteLocationRaw } from "vue-router";

export type TTabId = `${string}-${string}-${string}-${string}-${string}`;

export interface ITab {
    id: TTabId;
    title: string;
    route: RouteLocationRaw;
    icon?: string;
}

export interface IScreen {
    id: string;
    tabs: Map<TTabId, ITab>;
    activeTabId: TTabId | null;
    width?: number;
}

