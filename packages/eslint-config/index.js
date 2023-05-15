/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "next",
    "turbo",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "prettier"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "no-html-link-for-pages": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "**/*.config.js",
    "**/*.config.cjs",
    ".eslintrc.cjs",
    "common/**",
  ],
  reportUnusedDisableDirectives: true,
};

module.exports = config;
