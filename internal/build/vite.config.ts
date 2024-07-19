import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { compPkg, compRoot, getPackageManifest, outputRoot } from '@vue-quill-up/internal-utils';

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
        const pkg = getPackageManifest(compPkg);
        return Object.keys(pkg.peerDependencies || {}).some(pkg => id === pkg || id.startsWith(`${pkg}/`));
      },
      treeshake: true,
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
