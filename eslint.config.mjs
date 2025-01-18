import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"]
  },
  {
    languageOptions: { 
      globals: globals.browser,
      BigInt: true,
      env: {
        es2020: true // Thêm dòng này để kích hoạt các biến toàn cục của ES2020
      }
    }
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];