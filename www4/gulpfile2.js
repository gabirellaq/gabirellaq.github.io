/*  */
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    combiner = require('stream-combiner2'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-ruby-sass'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    minifyhtml = require('gulp-minify-html'),
    webpack = require('webpack'),
    WebpackDevServer = require("webpack-dev-server"),
    webpackConfig = require("./webpack.config.js");


var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}


//语法检查
gulp.task('jshint', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglifyjs', function () {
    var combined = combiner.obj([
        gulp.src('src/js/**/*.js')
            .pipe(concat('main.js'))    //合并所有js到main.js
            .pipe(gulp.dest('dist/js/'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js/'))
    ])
    combined.on('error', handleError)
})

gulp.task('minifycss', function () {
    gulp.src('src/css/**/*.css')
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css/'))
})

gulp.task('minifyhtml', function () {
    gulp.src('src/**/*.html')
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(concat('index.html'))
        .pipe(gulp.dest('dist/'))
        //.pipe(rename({suffix: ''}))
        .pipe(minifyhtml())
        .pipe(gulp.dest('dist/'))
})

gulp.task('sasscss', function () {
        sass('src/sass/**/*.scss')
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(concat('scss.css'))
        .pipe(gulp.dest('dist/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
})

gulp.task('image', function () {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
})


gulp.task('watch', function() {
    gulp.watch('src/js/**/*.js', ['jshint', 'uglifyjs']);
    gulp.watch('src/css/**/*.css', ['minifycss']);
    gulp.watch('src/sass/', ['sasscss']);
    gulp.watch('src/images/**/*', ['image']);
})


gulp.task('default', [
    'jshint', 'uglifyjs', 'minifycss', 'sasscss', 'image', 'watch', 'webpack-dev-server'
    ]
)

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task("build-dev", ["webpack:build-dev"], function() {
    gulp.watch(["app/**/*"], ["webpack:build-dev"]);
});

// Production build
gulp.task("build", ["webpack:build"]);

gulp.task("webpack:build", function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: "/" + myConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
    });
});