import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  // Less strict rules for test files
  {
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx", "**/jest.setup.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    ignores: [
      'node_modules/**',
      'public/**',
      '.next/**',
      'out/**',
      'storybook-static/**',
      '*.config.ts',
      '*.config.js',
      'next.config.js',
      'Icons.tsx',
      '!.storybook/**',
      '**/*.d.ts',
    ],
  },
];

export default eslintConfig;
