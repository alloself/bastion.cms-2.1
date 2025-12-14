<template>
    <Suspense>
        <VApp>
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
        </VApp>
    </Suspense>
    <!-- <PiniaColadaDevtools v-if="isDev()" /> -->
</template>

<script setup lang="ts">
import {
    Notification,
    useNotificationsStore,
} from "@admin/ts/features/notifications";
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
