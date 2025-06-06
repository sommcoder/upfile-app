/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-empty-export": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    // ! enable this at the end of development before pushing to prod/building
    // "no-console": ["error", { allow: ["warn", "error", "info"] }],
  },
  globals: {
    shopify: "readonly",
  },
};
