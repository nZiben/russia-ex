import { defineConfig } from 'vite';

export default defineConfig({
  base: '/russia-ex/',
  test: {
    environment: 'jsdom',
    globals: true
  }
});
