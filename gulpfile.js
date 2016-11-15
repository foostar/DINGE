/* eslint-disable */
var gulp = require('gulp'),
    less = require('gulp-less'),
     //确保本地已安装gulp-minify-css [cnpm install gulp-minify-css --save-dev]
    cssmin = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps');
 
gulp.task('testLess', function () {
    gulp.src('public/css/stylesheet.less')
        .pipe(less())
        // .pipe(cssmin()) //兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'));
});

gulp.task('testWatch', function () {
    gulp.watch('public/**/*.less', ['testLess']); //当所有less文件发生改变时，调用testLess任务
    gulp.watch('public/**/*.css', ['testLess']); //当所有less文件发生改变时，调用testLess任务
});

gulp.task('default', function(){
    gulp.run('testLess', 'testWatch');
})