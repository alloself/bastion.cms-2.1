import type { TUUID } from "@/ts/shared/types";

export interface ITab {
    id: TUUID;
    title: string;
    route: string;
    icon?: string;
}

export interface IScreen {
    id: TUUID;
    tabs: Map<TUUID, ITab>;
    activeTabId: TUUID | null;
    width: number;
}