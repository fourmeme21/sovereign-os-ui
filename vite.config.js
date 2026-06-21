import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.TAURI_ENV_PLATFORM ? "./" : "/",
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    outDir: "dist",
    target: ["es2021", "chrome105", "safari15"],
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // Not: @tauri-apps/* paketleri (api, plugin-fs, plugin-updater,
    // plugin-process vb.) tarayıcıya otomatik enjekte edilen globaller
    // DEĞİL, gerçek ES module'ler. Externalize edilirlerse tarayıcı
    // bare import'ları çözemez ve "Failed to resolve module specifier"
    // hatası verir. Bu yüzden hiçbiri external bırakılmıyor, hepsi
    // normal şekilde bundle'a dahil ediliyor.
  },
});