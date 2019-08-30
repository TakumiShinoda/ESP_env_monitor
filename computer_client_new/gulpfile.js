const gulp = require('gulp')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const webpackStream = require('webpack-stream')
const webpack = require('webpack')
const electron = require('electron-connect').server.create()

const webpackConfig = require('./webpack.config')

gulp.task('electron_reload', (done) => {
  electron.reload()
  done()
})

gulp.task('electron_restart', (done) => {
  electron.restart()
  done()
})

gulp.task('compile_main', () => {
  return plumber({errorHandler: notify.onError('<%= Error at \'compile_main\' =%>')})
    .pipe(webpackStream(webpackConfig[0], webpack))
    .pipe(gulp.dest("./dist/"))
})

gulp.task('compile_renderer', () => {
  return plumber({errorHandler: notify.onError('<%= Error at \'compile_renderer\' =%>')})
    .pipe(webpackStream(webpackConfig[1], webpack))
    .pipe(gulp.dest("./dist/"))
})

gulp.task('watch', (done) => {
  gulp.watch('./src/*', gulp.series(['compile_main', 'electron_restart']))
  gulp.watch('./src/renderer/*', gulp.series(['compile_renderer', 'electron_reload']))
  gulp.watch('./src/renderer/svg/*', gulp.series(['compile_renderer', 'electron_reload']))
  gulp.watch('./src/renderer/components/*', gulp.series(['compile_renderer', 'electron_reload']))
  electron.start()
  done()
})

gulp.task('compile', gulp.parallel(['compile_main', 'compile_renderer']))

gulp.task('start', gulp.series(['compile', 'watch']))