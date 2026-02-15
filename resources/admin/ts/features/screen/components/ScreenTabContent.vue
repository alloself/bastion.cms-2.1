<template>
    <Component
        v-if="component && tab"
        :is="component"
        v-bind="{ ...props, tab, screen }"
    />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { IScreen, ITab } from '../types'

defineProps<{
    component: Component | null
    props: Object
    tab: ITab
    screen: IScreen
}>()
</script>
