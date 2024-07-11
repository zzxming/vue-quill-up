#!/usr/bin/env node
import fs from 'node:fs';
import { resolve } from 'node:path';
import consola from 'consola';
import { compRoot, outputRoot, projRoot, run } from '@vue-quill-up/internal-utils';
import { version } from './version';
import { lintFiles } from './lint';

const copyFile = (src: string, dest: string) => new Promise<void>((resolve, reject) => {
  fs.copyFile(src, dest, (err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

const main = async () => {
  consola.info(`Update version to: ${version}`);

  // await run('pnpm run build', buildRoot);

  const compPkg = resolve(compRoot, 'package.json');
  const outputPkg = resolve(outputRoot, 'package.json');
  const projectPkg = JSON.parse(fs.readFileSync(compPkg, 'utf8'));
  projectPkg.version = version;

  const pkgData = JSON.stringify(projectPkg);
  fs.writeFileSync(
    compPkg,
    `{
      ${pkgData.slice(1, -1)}
    }`,
  );
  await lintFiles(compPkg);
  await copyFile(compPkg, outputPkg);
  await copyFile(resolve(projRoot, 'README.md'), resolve(outputRoot, 'README.md'));
  await run('npm publish', outputRoot);
};

main().catch((error) => {
  consola.error(error);
  process.exit(1);
});
