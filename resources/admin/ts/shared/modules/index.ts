import type { Page } from "@shared/types/models";
import type { IBaseEntity, ITableHeader } from "../types";
import { capitalize } from "lodash";
import { toKebabCase } from "../helpers";
import type { RouteLocation, RouteRecordRaw } from "vue-router";

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
const pageModule: IModule<Page> = {
    key: "page",
    title: "Страницы",
    icon: "mdi-file",
    showInNavigation: true,
    isDefault: true,
    headers: [
        {
            title: "Заголовок",
            key: "link.title",
        },
        {
            title: "Ссылка",
            key: "link.url",
        },
    ],
    getDetailTabTitle(entity: Page) {
        return `Страница #${entity.id}`;
    },
};

export const modules = [pageModule];

export const createModulesRoutes = () => {
    return modules.reduce<RouteRecordRaw[]>((acc, item) => {
        const routes = [];
        if (item.showInNavigation) {
            const listRoute: RouteRecordRaw = {
                path: `/${toKebabCase(item.key)}`,
                name: `${capitalize(item.key)}List`,
                props: {
                    module: item,
                },
                meta: {
                    module: item,
                },
                component: () =>
                    import(`@/ts/shared/modules/components/List.vue`),
            };
            if (item.isDefault) {
                listRoute.alias = listRoute.path;
                listRoute.path = "";
            }
            routes.push(listRoute);
        }
        routes.push(
            {
                path: `/${toKebabCase(item.key)}/create`,
                name: `${capitalize(item.key)}Create`,
                props: {
                    module: item,
                },
                meta: {
                    module: item,
                },
                component: () =>
                    import(`@/ts/shared/modules/components/Detail.vue`),
            },
            {
                path: `/${toKebabCase(item.key)}/:id`,
                name: `${capitalize(item.key)}Detail`,
                props: (route: RouteLocation) => ({
                    id: route.params.id,
                    module: item,
                }),
                meta: {
                    module: item,
                },
                component: () =>
                    import(`@/ts/shared/modules/components/Detail.vue`),
            }
        );

        acc.push(...routes);

        return acc;
    }, []);
};
