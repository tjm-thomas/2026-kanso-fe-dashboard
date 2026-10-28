import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The platform serves this app under /dashboard/ on the shared host (the prefix is not stripped),
// so every built file lives under /dashboard/. /api is the backend app on the same host.
export default defineConfig({
  base: "/dashboard/",
  plugins: [react()],
  server: {
    // Local dev: run the backend on port 8080 (e.g. docker run -p 8080:8080 <backend image>)
    proxy: { "/api": "http://localhost:8080" },
  },
});
