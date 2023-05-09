module.exports = {
  importOrder: [
    "^react$",
    "<THIRD_PARTY_MODULES>",
    "^@platform/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
};
