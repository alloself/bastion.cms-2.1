import { ref } from "vue";

const showNavigationDrawer = ref(true);

export const useNavigation = () => {
    const toggle = () => {
        showNavigationDrawer.value = !showNavigationDrawer.value;
    };

    return {
        showNavigationDrawer,
        toggle,
    };
};
