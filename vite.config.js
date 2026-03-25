import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env variables regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 3001,
      open: true,
    },
    define: {
      // Make env variables available for debugging
      __APP_ENV__: JSON.stringify(
        env.VITE_FIREBASE_API_KEY ? "found" : "missing",
      ),
    },
  };
});
