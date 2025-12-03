<template>
    <div>123</div>
</template>

<script setup lang="ts" generic="T extends IBaseEntity">
import type { IBaseEntity } from "@/admin/ts/types";
import type { IModule } from "..";

const { module } = defineProps<{
    module: IModule;
}>();
</script>
