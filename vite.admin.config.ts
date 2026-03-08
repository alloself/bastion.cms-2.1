import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineConfig({
    cacheDir: 'node_modules/.vite-admin',
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules/monaco-editor')) {
                        return 'monaco'
                    }
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5174,
        strictPort: true,
        hmr: { host: 'localhost', port: 5174 },
    },
    plugins: [
        tailwindcss(),
        laravel({
            input: [
                'resources/admin/styles/layers.css',
                'resources/admin/styles/tailwind.css',
                'resources/admin/styles/index.scss',
                'resources/admin/ts/index.ts',
            ],
            refresh: true,
            hotFile: 'storage/framework/vite.admin.hot',
            buildDirectory: 'build/admin',
        }),
        vue({ template: { transformAssetUrls } }),
        vuetify({
            autoImport: true,
            styles: {
                configFile: 'resources/admin/styles/settings.scss',
            },
        }),
    ],
    optimizeDeps: {
        exclude: ['vuetify', 'vue-router', 'monaco-editor'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/admin', import.meta.url)),
            '@shared': fileURLToPath(new URL('./resources/shared', import.meta.url)),
        },
    },
})
