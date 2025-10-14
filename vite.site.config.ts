import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        hmr: { host: 'localhost' },
    },
    plugins: [
        laravel({
            input: ['resources/site/css/app.css', 'resources/site/js/main.ts'],
            refresh: true,
            hotFile: 'storage/framework/vite.site.hot',
            buildDirectory: 'build/site',
        }),
        tailwindcss(),
    ],
    css: {
        postcss: './postcss.site.config.ts',
    },
});


