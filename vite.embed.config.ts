// vite.embed.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // root: ".", // Optional, can be wherever your embed code lives
  build: {
    rollupOptions: {
      input: [
        "./extensions/theme-app-blocks/assets/upfile-app-bridge.js",
        "./extensions/theme-app-blocks/assets/upfile-image-editor.js",
      ],
      output: {
        entryFileNames: "[name]-min.js",
        chunkFileNames: "[name]-min.js",
        assetFileNames: "[name]-min.[ext]",
      },
    },
    outDir: "./extensions/theme-app-blocks/assets", // Shopify expects it here
    emptyOutDir: false, // Don't wipe out other files in assets/

    assetsDir: "", // Prevent nesting like assets/assets/
    manifest: false,
  },
});
