import { isObject } from 'lodash'

import type { IBaseEntity, IBaseTreeEntity } from '@/ts/shared/types'

export const toKebabCase = (string: string) => {
    return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export const isBaseTreeEntity = <T extends IBaseEntity>(
    item: unknown,
): item is IBaseTreeEntity<T> => {
    return isObject(item) && 'id' in item && 'has_children' in item
}

export const isValidRedirectPath = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false
    }
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
        return false
    }
    if (!value.startsWith('/')) {
        return false
    }
    return true
}

export const traverseTree = <T extends IBaseTreeEntity<T>>(
    tree: T | T[],
    callback: (item: T) => void,
) => {
    const nodes = Array.isArray(tree) ? tree : [tree]

    for (const node of nodes) {
        callback(node)

        const children = node.children
        if (Array.isArray(children) && children.length) {
            traverseTree(children, callback)
        }
    }
}
