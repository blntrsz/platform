import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    react(),
    federation({
      name: "issues",
      filename: "remoteEntry.js",
      // Modules to expose
      exposes: {
        "./Page": "./src/Page.tsx",
        "./ListIssuesForUser": "./src/ListIssuesForUser.tsx",
      },
      shared: ["react", "react-dom", "@tanstack/react-query"],
    }),
  ],
});
