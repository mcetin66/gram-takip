import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Yerel çalışır; iPhone Safari'den test için host açık.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
