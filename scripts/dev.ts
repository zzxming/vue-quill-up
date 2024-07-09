#!/usr/bin/env node
import consola from 'consola';
import { run } from './utils';
import { demosRoot } from './constants';

const main = async () => {
  // run('pnpm run dev', themeRoot);
  run(`pnpm run dev`, demosRoot);
};

main().catch((error) => {
  consola.error(error);
  process.exit(1);
});
