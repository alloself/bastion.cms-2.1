<template>
    <VApp>
        <VMain>
            <RouterView v-slot="{ Component }">
                <component :is="Component" />
            </RouterView>
        </VMain>
    </VApp>
</template>
