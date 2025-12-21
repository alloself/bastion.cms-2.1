import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationsStore = defineStore("notifications", () => {
    const notifications = ref<{ color: string; content: string }[]>([]);

    const closeAlert = (index: number) => {
        notifications.value.splice(index, 1);
    };
    const removeAlert = () => {
        notifications.value.shift();
    };

    const pushNotification = (
        notification: { color: string; content: string },
        delay = 7000
    ) => {
        notifications.value.push(notification);
        setTimeout(() => {
            removeAlert();
        }, delay);
    };

    return {
        pushNotification,
        notifications,
        closeAlert,
    };
});
