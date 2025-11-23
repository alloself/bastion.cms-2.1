<template>
    <div>
        <h1>{{ module.title }}</h1>
    </div>
</template>

<script lang="ts" setup>
import type { IModule } from '..';


const { module } = defineProps<{
    module: IModule;
}>();

</script>

<style scoped>

</style>