<template>
    <div>{{ module }}</div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { IModule } from "..";
import type { IBaseEntity } from "../../types";

const { module } = defineProps<{
    module: IModule<T>;
}>();
</script>
