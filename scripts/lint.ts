import { loadESLint } from 'eslint';
import { projRoot } from '@vue-quill-up/internal-utils';

export const lintFiles = async (filePaths: string | string[]) => {
  const ESLint = await loadESLint();
  const eslint = new ESLint({
    fix: true,
    cwd: projRoot,
  });
  const results = await eslint.lintFiles(Array.isArray(filePaths) ? filePaths : [filePaths]);
  await ESLint.outputFixes(results);
};
