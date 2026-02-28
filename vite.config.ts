import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fieldnoteEditorPlugin } from './vite-plugins/fieldnote-editor.js';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  plugins: [react(), fieldnoteEditorPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
