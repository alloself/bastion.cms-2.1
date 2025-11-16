import { ref } from "vue";

const showNavigationDrawer = ref(false);

export const useNavigation = () => {
    const toggle = () => {
        showNavigationDrawer.value = !showNavigationDrawer.value;
    };

    return {
        showNavigationDrawer,
        toggle,
    };
};
