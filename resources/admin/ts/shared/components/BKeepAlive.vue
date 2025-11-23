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
import { computed, reactive, watch, markRaw, type Component } from "vue";

export interface CachedView {
    component: Component;
    props: Record<string, unknown>;
}

const { activeKey, component, componentProps } = defineProps<{
    activeKey: string | number | null;
    component: Component | null;
    componentProps?: Record<string, unknown>;
}>();

const cache = reactive(new Map<string | number, CachedView>());

const cachedEntries = computed(() => {
    return Array.from(cache.entries());
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

        if (!cache.has(nextState.activeKey)) {
            cache.set(nextState.activeKey, {
                component: markRaw(nextState.component),
                props: resolvedProps,
            });
            return;
        }

        const cachedView = cache.get(nextState.activeKey);

        if (!cachedView) {
            return;
        }

        cache.set(nextState.activeKey, {
            component: cachedView.component,
            props: resolvedProps,
        });
    },
    { immediate: true }
);

const removeEntry = (key: string | number) => {
    if (!cache.has(key)) {
        return;
    }
    cache.delete(key);
};

defineExpose({
    removeEntry,
});
</script>
