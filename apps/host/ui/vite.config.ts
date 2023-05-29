import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    react(),
    federation({
      name: "host-app",
      remotes: {
        issues:
          `${process.env.VITE_ISSUES_SITE?.replace(
            /\/$/,
            ""
          )}/assets/remoteEntry.js` ??
          "http://localhost:5001/assets/remoteEntry.js",
        users:
          `${process.env.VITE_USERS_SITE?.replace(
            /\/$/,
            ""
          )}/assets/remoteEntry.js` ??
          "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "@tanstack/react-query"],
    }),
  ],
});
