import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { compRoot, outputRoot } from '@vue-quill-up/internal-utils';

console.log(resolve(compRoot, 'index.ts'));
export default defineConfig({
  plugins: [
    vue(),
    esbuild({
      target: 'chrome64',
      loaders: {
        '.vue': 'js',
      },
    }),
    dts({
      entryRoot: compRoot,
      outDir: outputRoot,
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
    }),
  ],
  build: {
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: resolve(compRoot, 'index.ts'),
      preserveEntrySignatures: 'allow-extension',
      external: (id: string) => {
        const packages = ['@vue', 'vue', 'quill'];
        return Array.from(new Set(packages)).some(pkg => id === pkg || id.startsWith(`${pkg}/`));
      },
      treeshake: false,
      output: [
        {
          format: 'es',
          entryFileNames: 'index.js',
          dir: outputRoot,
        },
      ],
    },
  },
});
