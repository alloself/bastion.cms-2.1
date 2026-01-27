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

export interface ITabSerializable {
    id: TUUID;
    title: string;
    route: string;
    icon?: string;
}

export interface IScreenSerializable {
    id: TUUID;
    tabs: ITabSerializable[];
    activeTabId: TUUID | null;
    width: number;
}

export interface IScreenStateSerializable {
    screens: IScreenSerializable[];
    activeScreenId: TUUID | null;
}
    
export interface ITabDragData extends Record<string, unknown> {
    type: "tab";
    tabId: TUUID;
    screenId: TUUID;
    tab: ITab;
    index: number;
}