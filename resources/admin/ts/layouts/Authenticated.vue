<template>
    <VLayout>
        <VNavigationDrawer
            app
            v-model="showNavigationDrawer"
            :rail="railMode"
            mobile-breakpoint="sm"
        >
            <VList density="compact" nav>
                <VTooltip
                    v-for="item in items"
                    :key="item.key"
                    :disabled="!railMode"
                    location="right"
                >
                    <template #activator="{ props }">
                        <VListItem
                            nav
                            v-bind="props"
                            :prepend-icon="item.icon"
                            link
                            :title="item.title"
                            :active="isItemActive(item)"
                            @click="handleNavigationItemClick($event, item)"
                        ></VListItem>
                    </template>
                    <span>{{ item.title }}</span>
                </VTooltip>
            </VList>
            <template #append>
                <VList density="compact" nav>
                    <VListItem
                        nav
                        :prepend-icon="
                            railMode ? 'mdi-chevron-right' : 'mdi-chevron-left'
                        "
                        @click="toggleRailMode"
                    />
                </VList>
            </template>
        </VNavigationDrawer>
        <VAppBar
            app
            order="-1"
            :elevation="0"
            :border="true"
            class="app-bar"
            flat
            density="compact"
        >
            <VAppBarNavIcon
                class="ml-2"
                size="small"
                @click="showNavigationDrawer = !showNavigationDrawer"
            />
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
        </VAppBar>
        <VMain class="d-flex">
            <!-- <Screen
                v-for="(screen, index) in screenArray"
                :key="screen.id"
                :screen="screen"
                :is-last="index === screenArray.length - 1"
                :next-screen="screenArray[index + 1]"
            /> -->
        </VMain>
    </VLayout>
</template>

<script lang="ts" setup>
import { capitalize, computed, onMounted, ref, watch } from "vue";
import { modules, type IModule } from "@/ts/shared/modules";
import { sortBy } from "lodash";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { BLogo } from "@/ts/shared/components";
import { Screen, useScreenStore } from "@/ts/features/screen";
import { useAuthStore } from "@/ts/features/auth";

const router = useRouter();
const route = useRoute();

const screenStore = useScreenStore();
const { screens, activeScreen } = storeToRefs(screenStore);
const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const userMenu = ref(false);
const railMode = ref(true);
const showNavigationDrawer = ref(true);

const items = computed(() => {
    const array = sortBy(modules, ["title"]).reduce((acc, item) => {
        if (item.showInNavigation) {
            acc.push({ ...item, to: `${capitalize(item.key)}List` });
        }
        return acc;
    }, [] as IModule[]);

    return array;
});

const isItemActive = (item: IModule) => {
    if (!item.to) {
        return false;
    }

    const currentRouteName = route.name?.toString();
    if (!currentRouteName) {
        return false;
    }

    const moduleName = capitalize(item.key);
    return (
        currentRouteName === item.to || currentRouteName.startsWith(moduleName)
    );
};

const handleNavigationItemClick = async (
    event: MouseEvent | KeyboardEvent,
    item: IModule
) => {
    if (!item.to) {
        return;
    }

    await router.push({ name: item.to });

    if ((event.ctrlKey || event.metaKey) && activeScreen.value) {
        screenStore.openRouteTab(activeScreen.value, router.currentRoute.value);
    } else {
        screenStore.setActiveTabRoute(router.currentRoute.value);
    }
};

const onLogout = async () => {
    await authStore.logout();
};

const toggleRailMode = () => {
    railMode.value = !railMode.value;
};

watch(
    () => route.fullPath,
    () => {
        screenStore.setActiveTabRoute(router.currentRoute.value);
    }
);

onMounted(() => {
    if (screenStore.screens.size === 0) {
        const screen = screenStore.addScreen();
        screenStore.openRouteTab(screen, router.currentRoute.value);
    }
});
</script>
