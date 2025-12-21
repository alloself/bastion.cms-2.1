import type { RouteLocationRaw } from "vue-router";

export type TUUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ITab {
    id: TUUID;
    title: string;
    route: RouteLocationRaw;
    icon?: string;
}

export interface IScreen {
    id: TUUID;
    tabs: Map<TUUID, ITab>;
    activeTabId: TUUID | null;
    width: number;
}