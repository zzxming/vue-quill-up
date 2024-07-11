import { resolve } from 'node:path';

export const projRoot = resolve(__dirname, '../../..');
export const outputRoot = resolve(projRoot, 'dist');
export const scriptsRoot = resolve(projRoot, 'scripts');
export const demosRoot = resolve(projRoot, 'demos');
export const pkgRoot = resolve(projRoot, 'packages');
export const themeRoot = resolve(pkgRoot, 'theme');
export const buildRoot = resolve(pkgRoot, 'internal/build');
export const utilsRoot = resolve(pkgRoot, 'internal/utils');
export const compRoot = resolve(pkgRoot, 'vue-quill-up');
