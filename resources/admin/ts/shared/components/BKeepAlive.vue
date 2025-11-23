<template>
    <component
        v-for="[cacheKey, cachedView] in cachedEntries"
        :key="cacheKey"
        :is="cachedView.component"
        v-bind="cachedView.props"
        v-show="cacheKey === activeKey"
    />
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, type Component } from "vue";

export interface CachedView {
    component: Component;
    props: Record<string, unknown>;
}

const { activeKey, component, componentProps } = defineProps<{
    activeKey: string | number | null;
    component: Component | null;
    componentProps?: Record<string, unknown>;
}>();

const cache = shallowRef(new Map<string | number, CachedView>());

const cachedEntries = computed(() => {
    return Array.from(cache.value.entries());
});

const normalizeProps = (
    componentProps: Record<string, unknown> | undefined
): Record<string, unknown> => {
    if (!componentProps) {
        return {};
    }
    return componentProps;
};

watch(
    () => ({
        activeKey,
        component,
        componentProps,
    }),
    (nextState) => {
        if (nextState.activeKey === null || !nextState.component) {
            return;
        }

        const resolvedProps = normalizeProps(nextState.componentProps);

        if (!cache.value.has(nextState.activeKey)) {
            cache.value.set(nextState.activeKey, {
                component: nextState.component,
                props: resolvedProps,
            });
            return;
        }

        const cachedView = cache.value.get(nextState.activeKey);

        if (!cachedView) {
            return;
        }

        cache.value.set(nextState.activeKey, {
            component: cachedView.component,
            props: resolvedProps,
        });
    },
    { immediate: true }
);

const removeEntry = (key: string | number) => {
    if (!cache.value.has(key)) {
        return;
    }
    cache.value.delete(key);
};

defineExpose({
    removeEntry,
});
</script>
