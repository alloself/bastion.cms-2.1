import type { TUUID } from "@/ts/shared/types";
import type { RouteLocationRaw } from "vue-router";

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