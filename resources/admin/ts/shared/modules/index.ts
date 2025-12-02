import type {
    RouteLocation,
    RouteLocationNormalizedLoaded,
    RouteRecordRaw,
} from "vue-router";
import { toKebabCase } from "@admin/ts/shared/helpers";
import { capitalize, reactive, ref } from "vue";
import { defineStore } from "pinia";
import type {
    IBaseEntity,
    IModuleListParams,
    IServerDataList,
    ITableHeader,
} from "../../types";
import type { IModuleListQueryParams } from "./api";

export interface IModule {
    key: string;
    title: string;
    icon?: string;
    to?: string;
    showInNavigation?: boolean;
    isDefault?: boolean;
    headers: ITableHeader[];
    getDetailTabTitle?: (payload: { id: string }) => string;
}

export const modules: IModule[] = [
    {
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

export const resolveModuleTabMeta = (route: RouteLocationNormalizedLoaded) => {
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
    }, [] as RouteRecordRaw[]);
};

export const moduleStoresRegistry = reactive(
    new Map<IModule["key"], ReturnType<typeof createModuleStore>>()
);

const buildModuleListQueryParams = (params: IModuleListParams) => {
    const queryParams: IModuleListQueryParams = {
        page: params.page,
        per_page: params.perPage,
    };

    if (params.sortBy.length > 0) {
        queryParams.sortBy = params.sortBy;
    }

    if (params.search.trim() !== "") {
        queryParams.search = params.search;
    }

    return queryParams;
};

const getModuleBaseUrl = (module: IModule) => {
    return `/api/admin/${getModuleUrlPart(module.key)}`;
};

const createDefaultListParams = (): IModuleListParams => ({
    page: 1,
    perPage: 15,
    sortBy: [],
    search: "",
});

export const createModuleStore = (module: IModule) => {
    const baseUrl = getModuleBaseUrl(module);

    const store = defineStore(`${module.key}Store`, () => {
     

        const list = ref<IServerDataList<IBaseEntity> | null>(null);
        const entity = ref<IBaseEntity | null>(null);

        return {
            list,
            entity,
        };
    });

    moduleStoresRegistry.set(module.key, store);
    return store;
};

export const createModuleStores = (modules: IModule[]) => {
    return modules.forEach(createModuleStore);
};
