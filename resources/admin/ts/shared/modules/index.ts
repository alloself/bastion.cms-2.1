import type {
    RouteLocation,
    RouteLocationNormalizedLoaded,
    RouteRecordRaw,
} from "vue-router";
import { toKebabCase } from "@admin/ts/shared/helpers";
import { capitalize } from "vue";
import type {
    IBaseEntity,
    ITableHeader,
} from "../types";
import type { Page, Template } from "@/shared/types/models";

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
    getDetailTabTitle(entity: Template) {
        const templateName = entity.name;
        if (templateName.trim() !== "") {
            return `Шаблон #${templateName}`;
        }
        return `Шаблон #${entity.id}`;
    },
};

export const modules = [pageModule, templateModule];

type ModuleRouteView = "list" | "create" | "detail";

const moduleRouteSuffixes: Array<{ suffix: string; view: ModuleRouteView }> = [
    { suffix: "List", view: "list" },
    { suffix: "Create", view: "create" },
    { suffix: "Detail", view: "detail" },
];

const getModuleRouteMatch = (
    routeName: string | null
): { module: IModule; view: ModuleRouteView } | null => {
    if (!routeName) {
        return null;
    }
    const suffixMatch = moduleRouteSuffixes.find(({ suffix }) =>
        routeName.endsWith(suffix)
    );
    if (!suffixMatch) {
        return null;
    }
    const moduleNamePart = routeName.slice(
        0,
        routeName.length - suffixMatch.suffix.length
    );
    if (!moduleNamePart) {
        return null;
    }
    const moduleKey =
        moduleNamePart.charAt(0).toLowerCase() + moduleNamePart.slice(1);
    const matchedModule = modules.find(
        (moduleCandidate) => moduleCandidate.key === moduleKey
    );
    if (!matchedModule) {
        return null;
    }
    return {
        module: matchedModule,
        view: suffixMatch.view,
    };
};

const extractModuleRouteId = (route: RouteLocationNormalizedLoaded) => {
    const rawId = route.params?.id;
    if (typeof rawId === "string") {
        return rawId;
    }
    if (Array.isArray(rawId) && rawId.length > 0) {
        const [firstValue] = rawId;
        if (typeof firstValue === "string") {
            return firstValue;
        }
    }
    return null;
};

const getDefaultModule = (): IModule | undefined => {
    const explicitDefault = modules.find(
        (moduleCandidate) => moduleCandidate.isDefault
    );
    if (explicitDefault) {
        return explicitDefault;
    }

    const firstNavigable = modules.find(
        (moduleCandidate) => moduleCandidate.showInNavigation
    );
    if (firstNavigable) {
        return firstNavigable;
    }

    return modules[0];
};

export const resolveModuleTabMeta = (
    route: RouteLocationNormalizedLoaded
): { title: string; icon?: string } => {
    const routeName = route.name?.toString() ?? null;
    const match = getModuleRouteMatch(routeName);
    if (!match) {
        if (route.path === "/" || route.fullPath === "/") {
            const defaultModule = getDefaultModule();
            if (defaultModule) {
                return {
                    title: defaultModule.title,
                    icon: defaultModule.icon,
                };
            }
        }

        return {
            title: route.meta?.title?.toString() ?? route.fullPath,
        };
    }

    if (match.view === "list") {
        return {
            title: match.module.title,
            icon: match.module.icon,
        };
    }
    if (match.view === "create") {
        return {
            title: `${match.module.title}: Создание`,
            icon: match.module.icon,
        };
    }
    const routeId = extractModuleRouteId(route);
    if (!routeId) {
        return {
            title: `${match.module.title}: Создание`,
            icon: match.module.icon,
        };
    }
    return {
        title: `${match.module.title}: #${routeId}`,
        icon: match.module.icon,
    };
};

export const getModuleUrlPart = (key: string) => {
    return key
        .replace(/([A-Z])/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/^-/, "")
        .toLowerCase();
};

export const createModulesRoutes = (array: IModule[]): RouteRecordRaw[] => {
    return array.reduce<RouteRecordRaw[]>((acc, item) => {
        const routes: RouteRecordRaw[] = [];
        if (item.showInNavigation) {
            const listRoute: RouteRecordRaw = {
                path: `/${toKebabCase(item.key)}`,
                name: `${capitalize(item.key)}List`,
                props: {
                    module: item,
                },
                component: () =>
                    import(`@admin/ts/shared/modules/components/List.vue`),
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
                component: () =>
                    import(`@admin/ts/shared/modules/components/Detail.vue`),
            },
            {
                path: `/${toKebabCase(item.key)}/:id`,
                name: `${capitalize(item.key)}Detail`,
                props: (route: RouteLocation) => ({
                    id: route.params.id,
                    module: item,
                }),
                component: () =>
                    import(`@admin/ts/shared/modules/components/Detail.vue`),
            }
        );

        acc.push(...routes);

        return acc;
    }, []);
};


export const getModuleBaseUrl = (module: IModule) => {
    return `/api/admin/${getModuleUrlPart(module.key)}`;
};
