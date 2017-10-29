var gulp = require('gulp');
var csso = require('gulp-csso');
var watch = require('gulp-watch');
var browserSync = require('browser-sync');
var spawn = require('child_process').spawn;
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');
var minimist = require('minimist');
var args = minimist(process.argv.slice(2));

// declare the folders
var config = {
  imagesDir: 'src-static/src-img/**/*',
  imagesDist: 'static/img',
  imagesPattern: '*.{png,jpg,ico}',
  cssDir: 'src-static/src-css/',
  cssDist: 'static/css',
  cssPattern: '*.css',
  jsDir: 'src-static/src-js/',
  jsDist: 'static/js',
  jsPattern: '*.{js,htc}',
  confDir: 'src-static/.htaccess',
  confDist: 'static',
  txtDir: 'src-static/*.txt',
  txtDist: 'static'
}

gulp.task('build', function(done) {
    // copy images to destination
    gulp.src(config.imagesDir + config.imagesPattern)
      .pipe(gulp.dest(config.imagesDist))

    // copy js to destination and clean up
      gulp.src(config.jsDir + config.jsPattern)
        .pipe(gulp.dest(config.jsDist))

    // copy css to destination
    gulp.src(config.cssDir+config.cssPattern)
      .pipe(csso())
      .pipe(gulp.dest(config.cssDist))

    // copy .htaccess
    gulp.src(config.confDir)
      .pipe(gulp.dest(config.confDist))

    // copy imprint & Privacy
    gulp.src(config.txtDir)
      .pipe(gulp.dest(config.txtDist))
});

// default deploy for production
gulp.task('deploy', function() {
   // create ftp connection
    var remotePath = '/';
    var connection = ftp.create({
     host: args.server,
     user: args.user,
     password: args.password,
     log: gutil.log
   });
   gutil.log("host: " + args.server);
   gutil.log("user: " + args.user);
   // deploy to server and update
   gulp.src('public/**')
   .pipe(connection.newer(remotePath))
   .pipe(connection.dest(remotePath));

   // move .htaccess file to the server
   gulp.src('public/.htaccess')
   .pipe(connection.newer(remotePath))
   .pipe(connection.dest(remotePath));
});

gulp.task('copyImages', function(){
    // copy images to destination
    gulp.src(config.imagesDir + config.imagesPattern)
      .pipe(gulp.dest(config.imagesDist))
});

gulp.task('copyJS', function() {
    // copy js to destination
      gulp.src(config.jsDir + config.jsPattern)
        .pipe(gulp.dest(config.jsDist))
});

gulp.task('copyCSS', function() {
  // copy css to destination
  gulp.src(config.cssDir+config.cssPattern)
    .pipe(gulp.dest(config.cssDist))
});

gulp.task('copyTXT', function() {
  // copy txt to destination
  gulp.src(config.txtDir)
    .pipe(gulp.dest(config.txtDist))
});

gulp.task('hugo', function(done) {
  // run hugo server
  browserSync.notify('running hugo');
 return spawn('hugo', ['server', '-v', '-D', '-F', '-b=http://localhost:1313'], {stdio: 'inherit'}).on('close', done);
});

// watch for changes in src folders and execute the dev task
gulp.task('watch', function() {
  gulp.watch(config.imagesDir+config.imagesPattern, ['copyImages',])
  gulp.watch(config.jsDir+config.jsPattern, ['copyJS',])
  gulp.watch(config.cssDir+config.cssPattern, ['copyCSS',])
  gulp.watch(config.txtDir, ['copyTXT',])
});

gulp.task('browser-sync', ['hugo'], function () {
  browserSync({
    server : {
      baseDir: '_site'
    }
  });
});

gulp.task('default', ['browser-sync', 'watch']);