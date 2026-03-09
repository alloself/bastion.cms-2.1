import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@mdi/font/css/materialdesignicons.css'
import type { ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

const lightTheme: ThemeDefinition = {
    dark: false,
    colors: {
        primary: '#096ed1',
    },
}

const darkTheme: ThemeDefinition = {
    dark: true,
    colors: {
        primary: '#096ed1',
    },
}

export default createVuetify({
    theme: {
        defaultTheme: 'dark',
        themes: {
            light: lightTheme,
            dark: darkTheme,
        },
        variations: {
            colors: ['primary'],
            lighten: 2,
            darken: 2,
        },
        utilities: false,
    },
    display: {
        mobileBreakpoint: 'md',
        thresholds: {
            xs: 0,
            sm: 600,
            md: 840,
            lg: 1145,
            xl: 1545,
            xxl: 2138,
        },
    },
    defaults: {
        VDataTableServer: {
            itemsPerPageOptions: [
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
            ],
        },
        VTextField: {
           density: 'compact',
        },
        VAutocomplete: {
            density: 'compact',
        },
        VFileInput: {
            accept: 'image/*',
            density: 'compact',
        },
        VSelect: {
            density: 'compact',
        },
    },
})
