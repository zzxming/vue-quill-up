import { resolve } from 'node:path';
import { dest, series, src, task, watch } from 'gulp';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import cleanCSS from 'gulp-clean-css';
import consola from 'consola';

const distBundle = resolve(__dirname, './');

const buildTheme = async () => {
  return src('./src/*.less')
    .pipe(less())
    .pipe(postcss())
    .pipe(
      cleanCSS({}, (details) => {
        consola.success(`${details.name}: ${details.stats.originalSize / 1000} KB -> ${details.stats.minifiedSize / 1000} KB`);
      }),
    )
    .pipe(dest(distBundle));
};

const watchTheme = () => {
  watch('./src/*.less', buildTheme);
  consola.success('Watching theme files...');
};

task('dev', series(watchTheme));
task('default', series(buildTheme));
