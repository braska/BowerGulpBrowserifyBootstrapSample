var gulp = require('gulp');
var browserify = require('browserify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var notify = require("gulp-notify");
var bower = require('gulp-bower');
var livereload = require('gulp-livereload');
var source = require('vinyl-source-stream');
var debowerify = require('debowerify');
var uglify = require('gulp-uglify');
var streamify   = require('gulp-streamify');

var config = {
    sassPath: './resources/sass',
    jsPath: './resources/js',
    imgPath: './resources/img',
    bowerDir: './bower_components'
};

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir));
});

gulp.task('icons', function() {
    return gulp.src([config.bowerDir + '/font-awesome/fonts/**.*', config.bowerDir + '/bootstrap-sass/assets/fonts/bootstrap/**.*'])
        .pipe(gulp.dest('./public/fonts'))
        .pipe(livereload());
});

gulp.task('browserify', function() {
    return browserify(config.jsPath + '/main.js')
        .transform(debowerify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('css', function() {
    return gulp.src(config.sassPath + '/style.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                './resources/sass',
                config.bowerDir + '/bootstrap-sass/assets/stylesheets',
                config.bowerDir + '/font-awesome/scss'
            ]
        })
            .on("error", notify.onError(function (error) {
                return "Error: " + error.message;
            })))
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('images', function () {
    return gulp.src(config.imgPath + '/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('default', ['bower', 'icons', 'css', 'browserify'], function() {
    livereload.listen();
    gulp.watch(config.sassPath + '/**/*.scss', ['css']);
    gulp.watch(config.jsPath + '/**', ['browserify']);
    gulp.watch(config.imgPath + '/**', ['images']);
    gulp.watch('./public/*.html', function() {
        livereload.reload();
    });
});