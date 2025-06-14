import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": "off", // Allow console statements for debugging
      // "react-hooks/exhaustive-deps": "off", // Disable exhaustive-deps warnings for React hooks
      "@typescript-eslint/no-explicit-any": "off", // Allow usage of 'any' type in TypeScript
    },
  },
];

export default eslintConfig;
