import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projRoot = resolve(__dirname, '..');
export const outputRoot = resolve(projRoot, 'dist');
export const scriptsRoot = resolve(projRoot, 'scripts');
export const demosRoot = resolve(projRoot, 'demos');
export const pkgRoot = resolve(projRoot, 'packages');
export const themeRoot = resolve(pkgRoot, 'theme');
export const compRoot = resolve(pkgRoot, 'vue-quill-up');
