import { defineConfig } from "vite";

// Expose NEXT_PUBLIC_* from .env / .env.local to import.meta.env (same convention as Next.js).
export default defineConfig({
  envPrefix: "NEXT_PUBLIC_",
  server: {
    port: 5173,
  },
});
