<template>
    <v-snackbar
        :color="notification.color"
        position="sticky"
        location="top right"
        :model-value="true"
    >
        {{ notification.content }}
        <template v-slot:actions>
            <v-btn icon="mdi-close" variant="text" @click="emits('onCancel', notification)">
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import type { INotification } from '../types';

const { notification } = defineProps<{notification: INotification}>();


const emits = defineEmits<{
  onCancel: [value: INotification];
}>()
</script>