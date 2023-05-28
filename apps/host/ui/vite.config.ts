import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host-app",
      remotes: {
        issues: process.env.ISSUES_SITE ?? "",
        users: process.env.USERS_SITE ?? "",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
