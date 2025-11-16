<template>
    <VLayout>
        <VNavigationDrawer v-model="showNavigationDrawer">
            <VList density="compact" nav>
                <VListItem
                    nav
                    v-for="item in items"
                    :key="item.key"
                    :prepend-icon="item.icon"
                    link
                    :title="item.title"
                    :to="{ name: item.to }"
                ></VListItem>
            </VList>
        </VNavigationDrawer>
        <VAppBar
            order="-1"
            :elevation="0"
            :border="true"
            class="app-bar"
            flat
            density="compact"
        >
            <VAppBarNavIcon class="ml-2" size="small" @click="toggle" />
            <BLogo />
            <VAppBarTitle>Bastion.CMS</VAppBarTitle>
            <template #append>
                <VMenu
                    v-if="user"
                    v-model="userMenu"
                    :close-on-content-click="false"
                    location="bottom"
                >
                    <template #activator="{ props }">
                        <VBtn icon v-bind="props" size="small">
                            <VIcon>mdi-account-circle</VIcon>
                        </VBtn>
                    </template>
                    <VCard min-width="300">
                        <VList>
                            <VListSubheader>Пользователь</VListSubheader>
                            <VListItem :title="user.email"> </VListItem>
                        </VList>
                        <VDivider></VDivider>

                        <VCardActions>
                            <VBtn
                                color="primary"
                                variant="outlined"
                                size="small"
                                block
                                @click="onLogout"
                            >
                                Выйти
                            </VBtn>
                        </VCardActions>
                    </VCard>
                </VMenu>
            </template>
            <template #extension v-if="slots.extension">
                <slot name="extension"></slot>
            </template>
        </VAppBar>
        <VMain class="d-flex align-center justify-center">
            <RouterView v-slot="{ Component, route }">
                <Component :is="Component" :key="route.name" />
            </RouterView>
        </VMain>
    </VLayout>
</template>

<script lang="ts" setup>
import { capitalize, computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useNavigation } from "../shared/composables/useNavigation";
import { modules, type IModule } from "../shared/modules";
import { sortBy } from "lodash";
import { useUserStore } from "../entities/user";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import BLogo from "../shared/components/BLogo.vue";

const { showNavigationDrawer, toggle } = useNavigation();
const userStore = useUserStore();
const router = useRouter();

const { user } = storeToRefs(userStore);

const userMenu = ref(false);

const items = computed(() => {
    const array = sortBy(modules, ["title"]).reduce((acc, item) => {
        if (item.showInNavigation) {
            acc.push({ ...item, to: `${capitalize(item.key)}List` });
        }
        return acc;
    }, [] as IModule[]);

    return array;
});

const onLogout = () => {
    userStore.logout();
    router.push({ name: "Login" });
};

const slots = defineSlots<{
    extension: unknown;
}>();

const HTMLDOMElement = ref<HTMLHtmlElement | null>(null);

onMounted(() => {
    HTMLDOMElement.value = document.querySelector("html");
    if (HTMLDOMElement.value) {
        HTMLDOMElement.value.style.overflow = "hidden";
    }
});
onBeforeUnmount(() => {
    if (HTMLDOMElement.value) {
        HTMLDOMElement.value.style.overflow = "auto";
    }
});
</script>
