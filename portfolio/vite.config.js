// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    open: true,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});