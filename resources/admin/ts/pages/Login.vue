<template>
    <VContainer class="h-full flex items-center justify-center" fluid>
        <VCard class="elevation-12 w-full max-w-[400px]" @keyup.enter="handler">
            <VToolbar dark flat>
                <BLogo />
                <VToolbarTitle>Вход</VToolbarTitle>
                <VSpacer></VSpacer>
            </VToolbar>
            <VCardText> </VCardText>
            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn @click="handler" :loading="loading">Вход</VBtn>
            </VCardActions>
        </VCard>
    </VContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { BLogo } from '@/ts/shared/components'

const loading = ref(false)

const handler = () => {
    console.log('handler')
}
</script>
