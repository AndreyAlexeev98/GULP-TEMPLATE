// src('относительный от gulpfile путь')
// dest - записывает файлы в ('папку')
// pipe - реализует механизм потоков
const { src, dest } = require('gulp');

function copyFile() {
    return src('src/styles/main.scss').pipe( dest('dist') ) 
}

// Экспортируем 
exports.copy = copyFile; 