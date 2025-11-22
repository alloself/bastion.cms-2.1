<template>
    <v-app>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
        <notification
            v-for="(notification, index) in notifications"
            :key="index"
            :notification="notification"
            :style="getOffsetStyle(index)"
            @onCancel="notificationStore.closeAlert(index)"
        >
        </notification>
    </v-app>
    <PiniaColadaDevtools v-if="isDev()" />
</template>

<script setup lang="ts">
import { PiniaColadaDevtools } from "@pinia/colada-devtools";
import { isDev } from "@admin/ts/shared/helpers";

import { Notification, useNotificationsStore } from "@admin/ts/features/notifications";
import { storeToRefs } from "pinia";

const notificationStore = useNotificationsStore();
const { notifications } = storeToRefs(notificationStore);

const getOffsetStyle = (index: number) => {
    return {
        transform: `translateY(${index * 64}px)`,
    };
};
</script>

<style scoped></style>
