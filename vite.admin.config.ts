import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5174,
        strictPort: true,
        hmr: { host: 'localhost', port: 5174 },
    },
    plugins: [
        laravel({
            input: ['resources/admin/css/app.scss', 'resources/admin/js/main.ts'],
            refresh: true,
            hotFile: 'storage/framework/vite.admin.hot',
            buildDirectory: 'build/admin',
        }),
        vue({ template: { transformAssetUrls } }),
        vuetify({ autoImport: true }),
    ],
    css: {
        postcss: './postcss.admin.config.ts',
    },
});


