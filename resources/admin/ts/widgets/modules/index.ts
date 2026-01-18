import type { Page, Template } from "@shared/types/models";
import type { IModule } from "@/ts/shared/types";

import { capitalize } from "lodash";
import { toKebabCase } from "@/ts/shared/helpers";
import type {
    RouteLocation,
    RouteRecordRaw,
    RouteLocationNormalized,
} from "vue-router";
import { usePageForm, useTemplateForm } from "./forms";


export const pageModule: IModule<Page> = {
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
    getDetailTabTitle(entity?: Page) {
        if (!entity) {
            return "Создание страницы";
        }
        return `Страница ${entity.link?.title}`;
    },
    createForm: usePageForm,
    relations: {
        list: ["link"],
        detail: ["template", "link", "children.link", "parent.link",'audits.user'],
    },
    onEntityUpdate: (page, queryCache) => {
        const findDescendantsInCache = (parentId: string): string[] => {
            const descendants: string[] = [];
            const entries = queryCache.getEntries({ key: ["detail", "page"] });

            entries.forEach((entry) => {
                const cachedPage = entry.state.value.data as Page;
                if (cachedPage && cachedPage.parent_id === parentId) {
                    descendants.push(cachedPage.id);
                    descendants.push(...findDescendantsInCache(cachedPage.id));
                }
            });

            return descendants;
        };

        const descendantIds = findDescendantsInCache(page.id);

        descendantIds.forEach((descendantId) => {
            queryCache.invalidateQueries({
                key: ["detail", "page", descendantId],
                exact: true,
            });
        });

        if (descendantIds.length) {
            queryCache.invalidateQueries({
                key: ["list", "page"],
            });
        }
    },
};

const templateModule: IModule<Template> = {
    key: "template",
    title: "Шаблоны",
    icon: "mdi-code-greater-than-or-equal",
    showInNavigation: true,
    headers: [
        {
            title: "Название",
            key: "name",
        },
    ],
    getDetailTabTitle(entity?: Template) {
        if (!entity) {
            return "Создание шаблона";
        }
        return `Шаблон ${entity.name}`;
    },
    createForm: useTemplateForm,
};

export const modules = [pageModule, templateModule];

export const getDefaultModule = () => {
    return modules.find(
        ({ isDefault, showInNavigation }) => isDefault && showInNavigation
    );
};

export const getModuleFromMatchedRoutes = (
    route: RouteLocationNormalized,
    moduleKey: string
) => {
    const matchedRoute = route.matched
        .slice()
        .reverse()
        .find(({ meta }) => {
            return meta.module?.key === moduleKey;
        });

    return matchedRoute?.meta?.module;
};

export const createModulesRoutes = (): RouteRecordRaw[] => {
    return modules.reduce<RouteRecordRaw[]>((acc, item) => {
        const routes: RouteRecordRaw[] = [];
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
                    import(`@/ts/widgets/modules/components/List.vue`),
            };
            if (item.isDefault) {
                listRoute.alias = "/";
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
                    import(`@/ts/widgets/modules/components/Detail.vue`),
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
                    import(`@/ts/widgets/modules/components/Detail.vue`),
            }
        );

        acc.push(...routes);

        return acc;
    }, []);
};
