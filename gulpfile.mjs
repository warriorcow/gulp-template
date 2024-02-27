import gulp from 'gulp';
const { src, dest, watch, series, task } = gulp;
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(sass);
import autoprefixer from 'gulp-autoprefixer';
import fileInclude from 'gulp-file-include';
import concat from 'gulp-concat';
import browserSync from 'browser-sync';
import clean from 'gulp-clean';
import * as fs from "fs";
const server = browserSync.create();

const distFolder = 'dist';
const componentsFolderPath = 'src/components';

const componentsFilesPath = `${componentsFolderPath}/**/*.html`;
const componentsStylesPath = `${componentsFolderPath}/**/*.scss`;
const pagesPath = 'src/pages/*.html';
const mainStylePath = 'src/scss/main.scss';

function cleanDist(done) {
    if (fs.existsSync(distFolder)) {
        return src(distFolder, { read: false })
            .pipe(clean());
    }
    done();
}

function includeFiles() {
    return src(pagesPath)
        .pipe(fileInclude({
            basepath: componentsFolderPath
        }))
        .pipe(dest(distFolder))
        .pipe(server.stream())
}

function styles() {
    return src([mainStylePath, componentsStylesPath])
        .pipe(concat('style.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
        .pipe(scss())
        .pipe(dest(distFolder))
        .pipe(server.stream())
}

function reload(done) {
    server.reload();
    done();
}

function serve(done) {
    server.init({
        server: {
            baseDir: distFolder
        }
    });
    done();
}

const watcher = () => {
    watch([mainStylePath, componentsStylesPath], series(styles, reload))
    watch([pagesPath, componentsFilesPath], series(includeFiles, reload))
}

task('dev', series(cleanDist, styles, includeFiles, serve, watcher))
