// src('относительный от gulpfile путь')
// dest - записывает файлы в ('папку')
// pipe - реализует механизм потоков
// чтобы не писать gulp.task, метод task можно экспортировать в переменную
const { src, dest, task } = require('gulp');
const rm = require( 'gulp-rm' ); // Плагин удаления файлов

task( 'clean', () => {
    return src( 'dist/**/*', { read: false }).pipe( rm() )
  });

function copyFile() {
    return src('src/styles/**/*.scss').pipe( dest('dist') ) 
}

// Экспортируем задачу, если мы её описали не методом task а через функцию 
exports.copy = copyFile; 