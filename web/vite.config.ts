import { fileURLToPath, URL } from "node:url";
import { defineConfig, normalizePath } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

import { createMpaPlugin, createPages } from "vite-plugin-virtual-mpa";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const isProd = process.env.NODE_ENV === "production";

const pages = createPages([
  {
    name: "management",
    filename: isProd ? "management.html" : "src/management/index.html",
    template: "src/management/index.html",
    entry: "/src/management/main.js",
  },
  {
    name: "usage",
    filename: isProd ? "usage.html" : "src/usage/index.html",
    template: "src/usage/index.html",
    entry: "/src/usage/main.js",
  },
  {
    name: "view",
    filename: isProd ? "view.html" : "src/view/index.html",
    template: "src/view/index.html",
    entry: "/src/view/main.js",
  },
]);

const mpaPlugin = createMpaPlugin({
  pages,
  verbose: true,
  rewrites: [
    {
      from: /usage/,
      to: () => normalizePath("/src/usage/index.html"),
    },
    {
      from: /view/,
      to: () => normalizePath("/src/view/index.html"),
    },
    {
      from: /\/|\/management\/.?/,
      to: () => normalizePath("/src/management/index.html"),
    },
  ],
});

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      "lodash-es",
      "async-validator",
      "vuedraggable",
      "element-plus/es",
      "@wangeditor/editor-for-vue",
      "element-plus/es/components/*/style/index",
      "element-plus/dist/locale/zh-cn.mjs",
      "copy-to-clipboard",
      "qrcode",
      "moment",
      "moment/locale/zh-cn",
      "echarts",
      "nanoid",
      "yup",
      "crypto-js/sha256",
      "element-plus/es/locale/lang/zh-cn",
      "node-forge",
    ],
  },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // Auto import icon components
        IconsResolver({
          prefix: "Icon",
        }),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
        // Auto register icon components
        IconsResolver({
          enabledCollections: ["ep"],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
    mpaPlugin,
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@management": fileURLToPath(
        new URL("./src/management", import.meta.url),
      ),
      "@usage": fileURLToPath(new URL("./src/usage", import.meta.url)),
      "@view": fileURLToPath(new URL("./src/view", import.meta.url)),
      "@materials": fileURLToPath(new URL("./src/materials", import.meta.url)),
    },
  },
  appType: "mpa",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        // additionalData: `@import "@/management/styles/element-variables.scss";`
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    open: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        manualChunks(id) {
          // 建议根据项目生产实际情况进行优化
          if (id.includes("element-plus")) {
            return "element-plus";
          }
          if (id.includes("wangeditor")) {
            return "wangeditor";
          }
          if (id.includes("node-forge")) {
            return "node-forge";
          }
          if (id.includes("echarts")) {
            return "echarts";
          }

          if (id.includes("node_modules")) {
            return "packages";
          }
        },
      },
    },
  },
});
