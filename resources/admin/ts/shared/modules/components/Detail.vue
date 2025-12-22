<template>
    <div>{{ module }}</div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">

import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "../../types";

const { module, id } = defineProps<{
    module: IModule<T>;
    id?: TUUID;
}>();
</script>
