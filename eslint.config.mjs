import js from '@eslint/js';
import globals from 'globals';
import { flatConfigs as importXConfigs } from 'eslint-plugin-import-x';
import promisePlugin from 'eslint-plugin-promise';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/_site/**', '**/coverage/**', '**/*.min.js'] },

  js.configs.recommended,
  importXConfigs.recommended,
  promisePlugin.configs['flat/recommended'],

  // All JS files: shared settings and rules
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.es2022 },
    },
    rules: {
      'import-x/order': ['error', { 'newlines-between': 'always' }],
      // simple-icons is indexed by computed slug at module load in lib/filters.mjs.
      'import-x/namespace': ['error', { allowComputed: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // Node.js library files: add Node globals
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['**/scripts/**/*.js', '**/features/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Browser scripts: add browser globals
  {
    files: ['**/scripts/**/*.js', '**/features/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
    rules: { 'import-x/no-unresolved': ['error', { ignore: ['^virtual:'] }] },
  },

  // Test files: add Vitest globals
  {
    files: ['**/__tests__/**/*.mjs', '**/*.test.mjs'],
    languageOptions: { globals: { ...globals.vitest } },
  },

  // Vitest config: ignore unresolved vitest/config
  {
    files: ['**/vitest.config.mjs'],
    rules: { 'import-x/no-unresolved': ['error', { ignore: ['^vitest'] }] },
  },

  // Prettier (disables conflicting rules) - must be last
  prettierConfig,
];
