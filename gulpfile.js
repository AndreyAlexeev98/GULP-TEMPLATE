// src('принимает относительный от gulpfile путь')
// dest('принимает путь') - записывает файлы в переданный в аргументе путь
// pipe - реализует механизм потоков (streams) в node.js
// чтобы не писать gulp.task, метод task можно экспортировать в переменную

const { src, dest, task, series, watch } = require('gulp'); // чтобы не испортировать весь gulp, берем только то что используетс
const rm = require( 'gulp-rm' ); // Плагин удаления файлов
const sass = require('gulp-sass')(require('node-sass')); // Компялятор scss
const cleanCSS = require('gulp-clean-css'); // Минификация css
const rename = require("gulp-rename"); // Переименование файлов (например для добавления .min постфикса в минифицированный файл)
const sourcemaps = require('gulp-sourcemaps'); // формирует карту файла
const autoprefixer = require('gulp-autoprefixer'); // добавляет префексеры css
const concat = require('gulp-concat'); // конкатинация (склейка) файлов в один
const browserSync = require('browser-sync').create(); // Создание сервера для разработки
const reload = browserSync.reload; // Для перезагрузки страницы
const sassGlob = require('gulp-sass-glob'); // Для реализации маски при импорте стилей
const px2rem = require('gulp-smile-px2rem'); // Для перевода пикселей в rem
// const gcmq = require('gulp-group-css-media-queries'); // Группировка медиазапросов для оптимизации итогового css файла
const babel = require('gulp-babel'); // Транскомпилятор JS
const uglify = require('gulp-uglify'); // Минификация JS

const paths = {
  src: {
      base: './',
      css: './css',
      scss: './scss',
      node_modules: './node_modules/',
  },
  styles: [
    'node_modules/normalize.css/normalize.css',
    'node_modules/hystmodal/dist/hystmodal.min.css',
    'src/styles/main.scss'
  ],
  scripts: [
    'node_modules/hystmodal/dist/hystmodal.min.js',
    'src/scripts/*.js'
   ]
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
  return src( paths.styles )
    .pipe(concat('main.min.scss'))
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe( (sass().on('error', sass.logError)) )
    .pipe(px2rem())
    .pipe(autoprefixer({
      overrideBrowserslist: ['> 1%']
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    // .pipe(gcmq())
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }));
});

task('minify:css', () => {
  return src('dist/main.css')
    .pipe(cleanCSS())
    .pipe(rename(function(path) {
      path.extname = ".min.css";
    }))
    .pipe(dest('dist'));
});

task('scripts', () => {
  return src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js', {newLine: ';'})) // new line - что между модулями расставлялись - ;
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }));
 });

task('server', () => {
  browserSync.init({
     server: {
        baseDir: "./dist"
     },
     open: true
 });
});

watch('./src/*.html', series('copy:html'));
watch('./src/styles/**/*.scss', series('styles'));
watch('./src/scripts/**/*.js', series('scripts'));


task('default', series('clean', 'copy:html', 'styles', 'scripts', 'server'));