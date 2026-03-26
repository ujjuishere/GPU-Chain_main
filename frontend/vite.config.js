import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
      host: "0.0.0.0",
      port: 5173,
    proxy: {
      "/api": {
        target: "http://172.20.10.2:8080",
        changeOrigin: true
      },
      "/ws": {
        target: "ws://172.20.10.2:8080",
        ws: true
      }
    }
  }
});