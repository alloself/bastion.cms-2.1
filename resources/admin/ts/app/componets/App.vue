<template>
    <VApp>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </VApp>
</template>
