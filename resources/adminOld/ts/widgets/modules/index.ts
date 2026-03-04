import type { EntryKey, QueryCache } from '@pinia/colada'
import type { ContentBlock, Page, Template } from '@shared/types/models'
import { capitalize } from 'lodash'
import type { RouteLocation, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import { toKebabCase } from '@/ts/shared/helpers'
import type { ILinkableEntity, IModule } from '@/ts/shared/types'

import { isServerListData } from './api'
import { usePageForm, useTemplateForm } from './forms'
import { useContentBlockForm } from './forms/contentBlock'

const updateDescendantsUrls = <T extends ILinkableEntity>(
    queryCache: QueryCache,
    parentId: string,
    parentUrl: string | null,
    key: EntryKey,
) => {
    queryCache.getEntries({ key }).forEach((entry) => {
        queryCache.setQueryData(entry.key, (oldData: unknown) => {
            if (!isServerListData<T>(oldData)) {
                return oldData
            }

            const updatedData = oldData.data.map((item) => {
                if (item.parent_id !== parentId || !item.link || !item.id) {
                    return item
                }

                const newUrl = parentUrl ? `${parentUrl}/${item.link.slug}` : null

                return {
                    ...item,
                    link: {
                        ...item.link,
                        url: newUrl,
                    },
                }
            })

            return {
                ...oldData,
                data: updatedData,
            }
        })
    })
}

export const contentBlockModule: IModule<ContentBlock> = {
    key: 'content_block',
    title: 'Блоки контента',
    icon: 'mdi-view-grid',
    showInNavigation: true,
    headers: [
        {
            title: 'Название',
            key: 'name',
        },
    ],
    getDetailTabTitle(entity?: ContentBlock) {
        if (!entity) {
            return 'Создание блока контента'
        }
        return `Блок контента "${entity.name}"`
    },

    createForm: useContentBlockForm,
}

export const pageModule: IModule<Page> = {
    key: 'page',
    title: 'Страницы',
    icon: 'mdi-file',
    showInNavigation: true,
    isDefault: true,
    headers: [
        {
            title: 'Заголовок',
            key: 'link.title',
        },
        {
            title: 'Ссылка',
            key: 'link.url',
        },
    ],
    getDetailTabTitle(entity?: Page) {
        if (!entity) {
            return 'Создание страницы'
        }
        return `Страница "${entity.link?.title}"`
    },
    createForm: usePageForm,
    relations: {
        list: ['link'],
        detail: ['template', 'link', 'children.link', 'parent.link'],
    },
    onEntityUpdate: (page, queryCache) => {
        if (!page.link?.url) {
            return
        }
        updateDescendantsUrls<Page>(queryCache, page.id, page.link.url, [
            'list',
            'page',
            'infinity',
            'tree-children',
        ])
    },
}

export const templateModule: IModule<Template> = {
    key: 'template',
    title: 'Шаблоны',
    icon: 'mdi-code-greater-than-or-equal',
    showInNavigation: true,
    headers: [
        {
            title: 'Название',
            key: 'name',
        },
    ],
    getDetailTabTitle(entity?: Template) {
        if (!entity) {
            return 'Создание шаблона'
        }
        return `Шаблон "${entity.name}"`
    },
    createForm: useTemplateForm,
}

export const modules = [pageModule, templateModule, contentBlockModule]

export const getDefaultModule = () => {
    return modules.find(({ isDefault, showInNavigation }) => isDefault && showInNavigation)
}

export const getModuleFromMatchedRoutes = (route: RouteLocationNormalized, moduleKey: string) => {
    const matchedRoute = route.matched
        .slice()
        .reverse()
        .find(({ meta }) => {
            return meta.module?.key === moduleKey
        })

    return matchedRoute?.meta?.module
}

export const createModulesRoutes = (): RouteRecordRaw[] => {
    return modules.reduce<RouteRecordRaw[]>((acc, item) => {
        const routes: RouteRecordRaw[] = []
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
                component: () => import(`@/ts/widgets/modules/components/List.vue`),
            }
            if (item.isDefault) {
                listRoute.alias = '/'
            }
            routes.push(listRoute)
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
                component: () => import(`@/ts/widgets/modules/components/Detail.vue`),
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
                component: () => import(`@/ts/widgets/modules/components/Detail.vue`),
            },
        )

        acc.push(...routes)

        return acc
    }, [])
}
