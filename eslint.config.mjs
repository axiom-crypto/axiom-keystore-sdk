// eslint.config.mjs
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules'],  // You can add more ignore patterns here

    files: ['**/*.ts', '**/*.tsx'], // Lint all .ts/.tsx files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // If you need type-aware linting, specify:
        // project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },

    rules: {
      // Add your rules here, e.g.:
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
];