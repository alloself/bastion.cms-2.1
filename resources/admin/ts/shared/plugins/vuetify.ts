import "@mdi/font/css/materialdesignicons.css";
import { type ThemeDefinition, createVuetify } from "vuetify";
import {
    VTextField,
    VCheckbox,
    VFileInput,
    VTextarea,
    VDataTable,
    VDataTableServer,
    VCombobox,
    VSelect,
    VTreeview,
    VSkeletonLoader,
    VEmptyState,
} from "vuetify/components";

export const dark: ThemeDefinition = {
    dark: true,
    colors: {
        primary: "#096ed1",
    },
};

export default createVuetify({
    defaults: {
        VTextField: {
            variant: "solo-filled",
        },
        VAutocomplete: {
            variant: "solo-filled",
        },
        VFileInput: {
            variant: "solo-filled",
            accept: "image/*",
        },
        VSelect: {
            variant: "solo-filled",
        },
        VDataTable: {
            itemsPerPageOptions: [
                { value: 10, title: "10" },
                { value: 25, title: "25" },
                { value: 50, title: "50" },
                { value: 100, title: "100" },
            ],
        },
        VDataTableServer: {
            itemsPerPageOptions: [
                { value: 10, title: "10" },
                { value: 25, title: "25" },
                { value: 50, title: "50" },
                { value: 100, title: "100" },
            ],
        },
    },
    components: {
        VDataTable,
        VTextField,
        VCheckbox,
        VFileInput,
        VDataTableServer,
        VTextarea,
        VCombobox,
        VSelect,
        VTreeview,
        VSkeletonLoader,
        VEmptyState,
    },
    theme: {
        defaultTheme: "dark",
        themes: {
            dark,
        },
    },
});
