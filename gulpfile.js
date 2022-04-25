const gulp = require('gulp');
const livereload = require('gulp-livereload');

gulp.task('live-reload', () => {
    return gulp
        .src('*.txt', {read: false}) // do not read files ;)
        .pipe(livereload())
        ;
});

gulp.task('watch', () => {
    let webnetzSrc = 'src/custom/plugins/Webnetz*';

    livereload.listen();
    gulp.watch(
        ['./dist/**/*'],
        gulp.task('live-reload')
    );
});
