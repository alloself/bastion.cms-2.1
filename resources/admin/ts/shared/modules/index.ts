import type {
    RouteLocation,
    RouteLocationNormalizedLoaded,
    RouteRecordRaw,
} from "vue-router";
import { toKebabCase } from "@admin/ts/shared/helpers";
import { capitalize } from "vue";

export interface IModule {
    key: string;
    title: string;
    icon?: string;
    to?: string;
    showInNavigation?: boolean;
    headers: Array<{ title: string; key: string }>;
    getDetailTabTitle?: (payload: { id: string }) => string;
}

export const modules: IModule[] = [
    {
        key: "page",
        title: "Страницы",
        icon: "mdi-file",
        showInNavigation: true,
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
        getDetailTabTitle: ({ id }) => `Страница #${id}`,
    },
    {
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
        getDetailTabTitle: ({ id }) => `Шаблон #${id}`,
    },
];

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

export const resolveModuleTabMeta = (
    route: RouteLocationNormalizedLoaded
): { title: string; icon?: string } => {
    const routeName = route.name?.toString() ?? null;
    const match = getModuleRouteMatch(routeName);
    if (!match) {
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
    if (match.module.getDetailTabTitle) {
        return {
            title: match.module.getDetailTabTitle({ id: routeId }),
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
    return array.reduce((acc, item) => {
        const routes: RouteRecordRaw[] = [];
        if (item.showInNavigation) {
            const listRoute = {
                path: `/${toKebabCase(item.key)}`,
                name: `${capitalize(item.key)}List`,
                props: {
                    module: item,
                },
                component: () =>
                    import(`@admin/ts/shared/modules/components/List.vue`),
            } as RouteRecordRaw;
            if (item.key === "page") {
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
    }, [] as RouteRecordRaw[]);
};
