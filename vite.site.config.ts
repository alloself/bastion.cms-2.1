import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    cacheDir: 'node_modules/.vite-site',
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: { host: 'localhost', port: 5173 },
    },
    plugins: [
        laravel({
            input: ['resources/site/css/app.css', 'resources/site/js/main.ts'],
            refresh: true,
            hotFile: 'storage/framework/vite.site.hot',
            buildDirectory: 'build/site',
        }),
        vue({
            template: {
              transformAssetUrls: {
                base: null,
                includeAbsolute: false,
              },
            },
          }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': new URL('./resources', import.meta.url).pathname,
            '@admin': new URL('./resources/admin', import.meta.url).pathname,
            '@site': new URL('./resources/site', import.meta.url).pathname,
            '@shared': new URL('./resources/shared', import.meta.url).pathname,
        },
    },
    css: {
        postcss: './postcss.site.config.ts',
    },
});


