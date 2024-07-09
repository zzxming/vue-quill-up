import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: [
      {
        find: /^vue-quill-up\/(.+)/,
        replacement: resolve(__dirname, '../packages/$1'),
      },
      {
        find: 'vue-quill-up',
        replacement: resolve(__dirname, '../packages/vue-quill-up'),
      },
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
