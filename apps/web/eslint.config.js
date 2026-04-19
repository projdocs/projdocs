import { nextJsConfig } from "@packages/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "react/display-name": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
