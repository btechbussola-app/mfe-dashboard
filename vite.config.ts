import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_dashboard",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/App.tsx" },
      shared: {
        react: { singleton: true, requiredVersion: "^18.3.1" },
        "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
        "react-router-dom": { singleton: true, requiredVersion: "^6.28.0" },
        zustand: { singleton: true, requiredVersion: "^5.0.2" },
      },
    }),
  ],
  build: { target: "esnext", minify: true },
  base: "/mfe-dashboard/",
  server: { port: 5002, cors: true },
});
