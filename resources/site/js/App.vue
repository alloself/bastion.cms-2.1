<template>
  <div class="p-4">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Primary" />
      </template>
    </Toolbar>
    <div class="space-y-2">
      <InputText placeholder="PrimeVue + Tailwind v4 готово" class="w-80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
</script>

<style scoped>
</style>


