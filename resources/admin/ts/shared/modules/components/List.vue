<template>
    <div>123</div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { IBaseEntity } from "@/admin/ts/types";
import { moduleStoresRegistry, type IModule } from "..";

const { module } = defineProps<{
    module: IModule;
}>();

const useStore = moduleStoresRegistry.get(module.key);

if (!useStore) {
    throw new Error(
        `[modules] No store registered for module key "${module.key}".`
    );
}

const store = useStore();
</script>
