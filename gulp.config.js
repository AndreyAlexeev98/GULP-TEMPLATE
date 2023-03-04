// SRC_PATH - путь к папке с исходниками
// DIST_PATH - готовые к использованию в проекте файлы
// STYLE_LIBS - стили библиотек
// JS_LIBS - JavaScript библиотек

module.exports = {
    SRC_PATH: 'src',
    DIST_PATH: 'dist',
    STYLE_LIBS: [
        'node_modules/normalize.css/normalize.css',
        'node_modules/hystmodal/dist/hystmodal.min.css',
    ],
    JS_LIBS: [
        'node_modules/hystmodal/dist/hystmodal.min.js',
    ],
    SRC_ALL_HTML_PATH: 'src/**/*.html',
    SRC_ALL_SCSS_PATH: './src/styles/**/*.scss',
    SRC_MAIN_SCSS_PATH: 'src/styles/main.scss',
    SRC_ALL_JS_PATH: './src/scripts/**/*.js',
    SRC_SVG_PATH: 'src/img/icons/**/*.svg',
    SRC_PICTURE_PATH: 'src/img/pictures/**/*',
    MEDIA_ICONS_PATH: 'dist/media/icons',
    MEDIA_PICTURE_PATH: 'dist/media/pictures',
}