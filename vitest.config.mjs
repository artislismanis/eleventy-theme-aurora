import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'theme-aurora',
    globals: true,
    include: ['__tests__/**/*.test.mjs'],
  },
});
