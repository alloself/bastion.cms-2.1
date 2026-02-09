<template>
    <Component
        v-if="component && tab"
        :is="component"
        v-bind="props"
        :tab="tab"
    />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { ITab } from '../types'

defineProps<{
    component: Component | null
    props: Object
    tab: ITab
}>()
</script>
