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
import { capitalize, computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useNavigation } from "@admin/ts/shared/composables/useNavigation";
import { modules, type IModule } from "@admin/ts/shared/modules";
import { sortBy } from "lodash";
import { useUserStore } from "@admin/ts/entities/user";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import BLogo from "@admin/ts/shared/components/BLogo.vue";
import { Screen, useScreenStore } from "@admin/ts/features/screen";
import { useAuth } from "@admin/ts/features/auth";

const { showNavigationDrawer, toggle } = useNavigation();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const screenStore = useScreenStore();
const { logout } = useAuth();
const { screens } = storeToRefs(screenStore);
const { user } = storeToRefs(userStore);

const userMenu = ref(false);
const railMode = ref(true);
const screenArray = computed(() => {
    return Array.from(screens.value.values());
});

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
        currentRouteName === item.to ||
        currentRouteName.startsWith(moduleName)
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

    if (event.ctrlKey || event.metaKey) {
        const activeScreenId = screenStore.activeScreenId;

        let targetScreen =
            (activeScreenId && screenStore.screens.get(activeScreenId)) ||
            Array.from(screenStore.screens.values())[0] ||
            null;

        if (targetScreen) {
            screenStore.openRouteTab(targetScreen, router.currentRoute.value);
            return;
        }
    }

    screenStore.setActiveScreenTabRoute(router.currentRoute.value);
};

const onLogout = async () => {
    await logout();
};

const toggleRailMode = () => {
    railMode.value = !railMode.value;
};

const slots = defineSlots<{
    extension: unknown;
}>();

const HTMLDOMElement = ref<HTMLHtmlElement | null>(null);

onMounted(() => {
    if (screenStore.screens.size === 0) {
        const screen = screenStore.addScreen();
        screenStore.openRouteTab(screen, router.currentRoute.value);
    }

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
