// src('относительный от gulpfile путь')
// dest - записывает файлы в ('папку')
// pipe - реализует механизм потоков
// чтобы не писать gulp.task, метод task можно экспортировать в переменную

const { src, dest, task, series, watch } = require('gulp');
const rm = require( 'gulp-rm' ); // Плагин удаления файлов
const sass = require('gulp-sass')(require('node-sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
  src: {
      base: './',
      css: './css',
      scss: './scss',
      node_modules: './node_modules/',
      vendor: './vendor',
      styles: [
        'node_modules/normalize.css/normalize.css',
        'src/styles/main.scss'
      ],
  }
};

task( 'clean', () => {
  return src( 'dist/**/*', { read: false }).pipe( rm() )
});

task( 'copy:html', () => {
  return src('src/*.html')
  .pipe(dest('dist'))
  .pipe(reload({ stream: true }));
});

task( 'styles', () => {
  return src( paths.src.styles )
    .pipe(concat('main.scss'))
    .pipe(sourcemaps.init())
    .pipe( (sass().on('error', sass.logError)) )
    .pipe(autoprefixer({
      overrideBrowserslist: ['> 1%']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }));
});

task('minify:css', () => {
  return src('dist/main.css')
    .pipe(cleanCSS({compatibility: '*'}))
    .pipe(rename(function(path) {
      path.extname = ".min.css";
    }))
    .pipe(dest('dist'));
});

task('server', () => {
  browserSync.init({
     server: {
        baseDir: "./dist"
     },
     open: true
 });
});

watch('./src/styles/**/*.scss', series('styles'));
watch('./src/*.html', series('copy:html'));

task('default', series('clean', 'copy:html', 'styles', 'server'));