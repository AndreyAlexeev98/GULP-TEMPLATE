// src('принимает относительный от gulpfile путь')
// dest('принимает путь') - записывает файлы в переданный в аргументе путь
// pipe - реализует механизм потоков (streams) в node.js
// чтобы не писать gulp.task, метод task можно экспортировать в переменную

const { src, dest, task, series, watch, parallel } = require('gulp'); // чтобы не испортировать весь gulp, берем только то что будем использовать
const rm = require( 'gulp-rm' ); // Плагин удаления файлов
const sass = require('gulp-sass')(require('node-sass')); // Компялятор scss
const cleanCSS = require('gulp-clean-css'); // Минификация css
const rename = require("gulp-rename"); // Переименование файлов 
const sourcemaps = require('gulp-sourcemaps'); // формирует карту файла
const autoprefixer = require('gulp-autoprefixer'); // добавляет префексеры css
const concat = require('gulp-concat'); // конкатинация (склейка) файлов в один
const browserSync = require('browser-sync').create(); // Создание сервера для разработки
const reload = browserSync.reload; // Для перезагрузки страницы
const sassGlob = require('gulp-sass-glob'); // Для реализации маски при импорте стилей
const px2rem = require('gulp-smile-px2rem'); // Для перевода пикселей в rem
const gcmq = require('gulp-group-css-media-queries'); // Группировка медиазапросов для оптимизации
const babel = require('gulp-babel'); // Транскомпилятор JS
const uglify = require('gulp-uglify'); // Минификация JS
const svgo = require('gulp-svgo'); // Оптимизация xml кода
const svgSprite = require('gulp-svg-sprite'); // Для склейки svg в спрайт
const gulpif = require('gulp-if'); // для разделения используемых плагинов в dev и prod режимах
const env = process.env.NODE_ENV; // для работы с переменными окружения 

// Импорт конфигурации проекта
const { SRC_PATH, DIST_PATH, STYLE_LIBS, JS_LIBS, SRC_ALL_HTML_PATH, SRC_ALL_SCSS_PATH, SRC_MAIN_SCSS_PATH, SRC_ALL_JS_PATH, SRC_SVG_PATH, SRC_PICTURE_PATH, MEDIA_ICONS_PATH, MEDIA_PICTURE_PATH } = require('./gulp.config');

// Очистка папки с готовыми файлами (применяется для корректного обновления файлов при изменении исходников)
task( 'clean', () => {
  return src(`${DIST_PATH}/**/*`, { read: false }).pipe( rm() )
});

// Работа с иконками
task('icons', () => {
  return src(SRC_SVG_PATH)
  .pipe(svgo({
    plugins: [
      {
        removeAttrs: {
          attrs: '(fill|stroke|style|width|height|data.*)'
        }
      }
    ]
  }))
  .pipe(svgSprite({
    mode: {
      symbol: {
        sprite: '../sprite.svg'
      }
    }
  }))
  .pipe(dest(MEDIA_ICONS_PATH))
});

// Работа с html
task( 'copy:html', () => {
  return src(SRC_ALL_HTML_PATH)
  .pipe(dest(DIST_PATH))
  .pipe(reload({ stream: true }));
});

// Работа с картинками
task( 'copy:pictures', () => {
  return src(SRC_PICTURE_PATH)
  .pipe(dest(MEDIA_PICTURE_PATH))
  .pipe(reload({ stream: true }));
});

// Работа со стилями
task( 'styles', () => {
  return src([...STYLE_LIBS, SRC_MAIN_SCSS_PATH])
    .pipe(concat('main.scss'))
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(sassGlob())
    .pipe( (sass().on('error', sass.logError)) )
    .pipe(px2rem())
    .pipe(gulpif(env === 'prod', autoprefixer({
      overrideBrowserslist: ['> 1%'],
      cascade: false
    })))
    .pipe(gulpif(env === 'prod', gcmq()))
    .pipe(gulpif(env === 'prod', cleanCSS()))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest(DIST_PATH))
    .pipe(reload({ stream: true }));
});

// Переименование css (для prod)
task('rename_main_css', () => {
  return src(`${DIST_PATH}/main.css`)
    .pipe(rename(function(path) {
      path.extname = ".min.css";
    }))
    .pipe(dest(DIST_PATH));
});

// Переименование css (для prod)
task('rename_main_js', () => {
  return src(`${DIST_PATH}/main.js`)
    .pipe(rename(function(path) {
      path.extname = ".min.js";
    }))
    .pipe(dest(DIST_PATH));
});

// Удалание main.css (для prod)
task('remove_main_css', () => {
  return src(`${DIST_PATH}/main.css`)
    .pipe( rm() )
});

// Удалание main.js (для prod)
task('remove_main_js', () => {
  return src(`${DIST_PATH}/main.js`)
    .pipe( rm() )
});

// Работа с JsvaScript
task('scripts', () => {
  return src([...JS_LIBS, SRC_ALL_JS_PATH])
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(concat('main.js', {newLine: ';'})) // new line - установка между модулями знака - ';', для избежания ошибок при интерпритации
    .pipe(gulpif(env === 'prod', babel({
      presets: ['@babel/env']
    })))
    .pipe(gulpif(env === 'prod', uglify()))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest(DIST_PATH))
    .pipe(reload({ stream: true }));
 });

task('server', () => {
  browserSync.init({
     server: {
        baseDir: DIST_PATH
     },
     open: true,
    /* Если потребуется перехвачивать с другого порта:
    server - удалить,
    notify: false,
    proxy: "localhost:41080" // - номер другого порта
    */
 });
});

// Запускаем определенные такски при изменении определенных исходных файлов:
task('watch', () => {
  watch(SRC_ALL_HTML_PATH, series('copy:html'));
  watch(SRC_SVG_PATH, series('icons'));
  watch(SRC_PICTURE_PATH, series('copy:pictures'));
  watch(SRC_ALL_SCSS_PATH, series('styles'));
  watch(SRC_ALL_JS_PATH, series('scripts'));
});

// Для деплоя на сервер
task('prod',
  series(
    'clean', 
    parallel('copy:html', 'copy:pictures', 'icons', 'styles', 'scripts'),
    parallel('rename_main_css', 'rename_main_js'),
    parallel('remove_main_css', 'remove_main_js')
 )
);

// Сначало идет очистка выходных файлов, затем паралельно (для оптимизации) выполняются таски которые могут не ждать завершения друг друга, затем запускается сервер и вотчеры
task('dev', 
  series(
    'clean', 
    parallel('copy:html', 'copy:pictures', 'icons', 'styles', 'scripts', ),  
    parallel('watch', 'server')
  )
);