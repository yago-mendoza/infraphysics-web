import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mediaSyncPlugin } from './vite-plugins/media-sync.js';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
    watch: {
      ignored: ['**/room/chrome-wiki-audit/**'],
    },
  },
  plugins: [react(), mediaSyncPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
