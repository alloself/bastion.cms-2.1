import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineConfig({
    cacheDir: "node_modules/.vite-admin",
    server: {
        host: "0.0.0.0",
        port: 5174,
        strictPort: true,
        hmr: { host: "localhost", port: 5174 },
    },
    plugins: [
        laravel({
            input: [
                "resources/admin/scss/index.scss",
                "resources/admin/ts/index.ts",
            ],
            refresh: true,
            hotFile: "storage/framework/vite.admin.hot",
            buildDirectory: "build/admin",
        }),
        vue({ template: { transformAssetUrls } }),
        vuetify({
            styles: {
                configFile: "resources/admin/scss/vuetify.scss",
            },
        }),
    ],
    optimizeDeps: {
        exclude: ["vuetify", "vue-router"],
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./resources", import.meta.url)),
            "@admin": fileURLToPath(new URL("./resources/admin", import.meta.url)),
            "@site": fileURLToPath(new URL("./resources/site", import.meta.url)),
            "@shared": fileURLToPath(new URL("./resources/shared", import.meta.url)),
        },
    },
    css: {
        postcss: "./postcss.admin.config.ts",
    },
});
