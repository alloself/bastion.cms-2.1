import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
        host: 'localhost',
        port: 5174,
        strictPort: true,
        hmr: { host: 'localhost' },
    },
    plugins: [
        laravel({
            input: ['resources/admin/css/app.css', 'resources/admin/js/main.ts'],
            refresh: true,
            hotFile: 'storage/framework/vite.admin.hot',
            buildDirectory: 'build/admin',
        }),
        vue({ template: { transformAssetUrls } }),
        vuetify(),
        tailwindcss(),
    ],
    css: {
        postcss: './postcss.admin.config.ts',
    },
});


