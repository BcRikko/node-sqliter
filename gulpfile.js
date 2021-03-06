/// <reference path="./typings/index.d.ts" />

const gulp = require('gulp');

const typescript = require('gulp-typescript');
const tsProject = typescript.createProject('tsconfig.json');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const del = require('del');

const mocha = require('gulp-mocha');

gulp.task('clean-test', ['build-test'], () => {
    return del.sync(['src/*.js', 'test/*.js']);
});

gulp.task('build-test', () => {
    return gulp.src(['test/**/*.ts', 'src/**/*.ts'], { base: '.' })
        .pipe(typescript(tsProject))
        .pipe(babel())
        .pipe(gulp.dest('.'))
        .pipe(mocha({
            reporter: 'progress',
            timeout: 5000
        }));
});

gulp.task('clean', () => {
    return del.sync(['lib']);
});

gulp.task('build', ['clean'], () => {
    const tsResult = gulp
        .src([
            'src/**/*.ts'
        ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(babel())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./lib'));
});

gulp.task('test', ['clean-test']);

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('default', ['build']);