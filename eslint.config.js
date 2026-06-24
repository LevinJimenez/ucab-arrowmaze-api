// ESLint v10 flat config — equivalente al .eslintrc.json del plan
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Excluir código autogenerado y artefactos de build del lint
  { ignores: ['src/generated/**', 'dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Desactivar la versión JS base (TS la sobreescribe)
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // REGLA DURA: prohibido `any`
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
