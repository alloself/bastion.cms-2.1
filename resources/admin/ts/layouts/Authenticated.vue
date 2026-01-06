<template>
    <VLayout>
        <VNavigationDrawer
            app
            v-model="showNavigationDrawer"
            :rail="railMode"
            mobile-breakpoint="sm"
            density="compact"
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
            <Screen
                v-for="(screen, index) in screenArray"
                :key="screen.id"
                :screen="screen"
                :is-last="index === screenArray.length - 1"
                :next-screen="screenArray[index + 1]"
            />
        </VMain>
    </VLayout>
</template>

<script lang="ts" setup>
import { capitalize, computed, onMounted, ref, watch } from "vue";
import {
    modules,
    getDefaultModule,
    getModuleFromMatchedRoutes,
} from "@/ts/widgets";
import { sortBy } from "lodash";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { BLogo, routeNames } from "@/ts/shared";
import { Screen, useScreenStore } from "@/ts/features/screen";
import { useAuthStore } from "@/ts/features/auth";

type TNavigationModuleItem = {
    title: string;
    icon?: string;
    to: string;
    key: string;
    showInNavigation: boolean;
};

const router = useRouter();
const route = useRoute();

const screenStore = useScreenStore();
const { screens, activeScreen } = storeToRefs(screenStore);
const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const userMenu = ref(false);
const railMode = ref(true);
const showNavigationDrawer = ref(true);

const screenArray = computed(() => {
    return Array.from(screens.value.values());
});

const items = computed(() => {
    const array = sortBy(modules, ["title"]).reduce<TNavigationModuleItem[]>(
        (acc, item) => {
            if (item.showInNavigation) {
                acc.push({
                    title: item.title,
                    icon: item.icon,
                    to: `${capitalize(item.key)}List`,
                    key: item.key,
                    showInNavigation: item.showInNavigation,
                });
            }
            return acc;
        },
        []
    );

    return array;
});

const isItemActive = (item: TNavigationModuleItem) => {
    if (!item.to) {
        return false;
    }

    const currentRouteName = route.name?.toString();
    if (!currentRouteName) {
        return false;
    }

    if (currentRouteName === item.to) {
        return true;
    }

    const moduleName = capitalize(item.key);
    if (currentRouteName.startsWith(moduleName)) {
        return true;
    }

    if (route.meta.module?.key === item.key) {
        return true;
    }

    if (currentRouteName === routeNames.Authenticated) {
        const matchedModule = getModuleFromMatchedRoutes(route, item.key);
        if (matchedModule) {
            return true;
        }

        const defaultModule = getDefaultModule();
        if (defaultModule?.key === item.key) {
            return true;
        }
    }

    return false;
};

const { pause: pauseRouteWatch, resume: resumeRouteWatch } = watch(
    () => route.fullPath,
    () => {
        screenStore.setActiveTabRoute(router.currentRoute.value);
    }
);

const handleNavigationItemClick = async (
    event: MouseEvent | KeyboardEvent,
    item: TNavigationModuleItem
) => {
    if (!item.to) {
        return;
    }

    const shouldOpenNewTab =
        (event.ctrlKey || event.metaKey) && activeScreen.value;

    if (shouldOpenNewTab) {
        pauseRouteWatch();
    }

    await router.push({ name: item.to });

    if (shouldOpenNewTab && activeScreen.value) {
        screenStore.openRouteTab(activeScreen.value, router.currentRoute.value);
        resumeRouteWatch();
    } else {
        screenStore.setActiveTabRoute(router.currentRoute.value);
    }
};

const onLogout = async () => {
    authStore.logout();
    router.push({ name: "Login" });
};

const toggleRailMode = () => {
    railMode.value = !railMode.value;
};

onMounted(() => {
    if (screenStore.screens.size === 0) {
        const screen = screenStore.addScreen();
        screenStore.openRouteTab(screen, router.currentRoute.value);
    }
});
</script>
