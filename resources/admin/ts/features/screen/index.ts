export { default as Screen } from "./components/Screen.vue";

export type { ITab, IScreen } from "./types";

export { useScreenStore } from "./store";

export {
    useScreenNavigation,
    resolveComponentExport,
    isVueComponent,
} from "./composables";
