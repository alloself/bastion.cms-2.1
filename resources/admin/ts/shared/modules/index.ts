import type { IBaseEntity, ITableHeader } from "../types";

export interface IModule<T extends IBaseEntity = IBaseEntity> {
    key: string;
    title: string;
    icon?: string;
    to?: string;
    showInNavigation?: boolean;
    isDefault?: boolean;
    headers: ITableHeader[];
    getDetailTabTitle?(entity: T): string;
}

export const createModulesRoutes = () => {
    return [];
};

export const modules = [] as unknown as IModule<IBaseEntity>[];
