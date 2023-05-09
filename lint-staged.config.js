// eslint-disable-next-line no-undef
module.exports = {
  "**/*.{js,jsx,mjs,ts,tsx,mts}": [
    `prettier --ignore-path .gitignore --write`,
    `eslint --max-warnings=0 --fix`,
  ],
};
