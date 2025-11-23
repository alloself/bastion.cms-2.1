<template>
    <div>
        <h1>{{ module.title }}</h1>
        <input type="text" v-model="search" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { IModule } from '..';

const { module } = defineProps<{
    module: IModule;
}>();

const search = ref("");
</script>

<style scoped>

</style>