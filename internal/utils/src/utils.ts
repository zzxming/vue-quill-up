import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { projRoot } from './constants';

interface Manifest {
  version: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export const run = async (command: string, cwd: string = projRoot) =>
  new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const app = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    const onProcessExit = () => app.kill('SIGHUP');

    app.on('close', (code) => {
      process.removeListener('exit', onProcessExit);

      if (code === 0) {
        resolve();
      }
      else {
        reject(new Error(`Command failed. \n Command: ${command} \n Code: ${code}`));
      }
    });
    process.on('exit', onProcessExit);
  });

export const getPackageManifest = (pkgPath: string): Manifest => {
  return JSON.parse(readFileSync(pkgPath, 'utf8')) as Manifest;
};
