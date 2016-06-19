/// <reference path="./typings/index.d.ts" />

const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const del = require('del');

gulp.task('clean', () => {
    return del.sync([
        'lib'
    ]);
});

gulp.task('build', ['clean'], () => {
    const tsResult = gulp
        .src([
            'src/**/*.ts'
        ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(typescript({
            typescript: require('typescript'),
            target: 'es6',
            module: 'es6',
            removeComments: false,
            declaration: true
        }));
    
return tsResult
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./lib')); 
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('default', ['build']);