import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group TanStack libraries together
          tanstack: ["@tanstack/react-query", "@tanstack/react-router", "@tanstack/react-table"],
          // Group UI components together
          "ui-components": [
            "@/components/ui/button",
            "@/components/ui/card",
            "@/components/ui/badge",
            "@/components/ui/skeleton",
            "@/components/ui/select",
            "@/components/ui/field",
          ],
          // Group auth-related code
          auth: ["@/lib/auth-client", "@/lib/auth", "@/lib/query-options"],
          // Group large dependencies
          vendor: ["react-hook-form", "zod", "@hookform/resolvers", "date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },

  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});

export default config;
