// --------------------------------------------------------------------------
//
//  Gulp Config
//    Default build for development will watch and recompile, with debug
//    information on each change of local styleheets + javascript files.
//
// --------------------------------------------------------------------------


var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    mainBowerFiles = require('main-bower-files'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    path = require('path'),
    fs = require("fs")


// --------------------------------------------------------------------------
//   Configuration
// --------------------------------------------------------------------------

var bowerrc = JSON.parse(fs.readFileSync('.bowerrc', 'utf8'))

var config = {
  url: 'hipflask.dev',
  styles: './assets/styles',
  scripts: './assets/scripts',
  images: './assets/images',
  icons: './assets/icons',
  vendor: bowerrc.directory
}


// --------------------------------------------------------------------------
//   Browser Sync
// --------------------------------------------------------------------------

gulp.task('browser-sync', () => {

  // Watch these files and trigger reload

  var files = [
        '**/*.php',
        '**/*.{png,jpg,gif}'
      ]

  browserSync.init({

    // Read here http://www.browsersync.io/docs/options/
    proxy: config.url,
    open: 'external',
    files: files,
    // host: "192.168.0.114",

    port: 3002,

    // Tunnel the Browsersync server through a random Public URL
    // tunnel: true,

    // Attempt to use the URL "http://my-private-site.localtunnel.me"
    // tunnel: "ppress",

    // Inject CSS changes
    injectChanges: true,

    // Fix cross origin resource issues
    middleware: (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      next()
    },

    // Place browsersync snippet at bottom to fix a conflict with the IE8 conditional body tag
    snippetOptions: {
      whitelist: ['/wp-admin/admin-ajax.php'],
      rule: {
        match: /<\/body>/i,
        fn: (snippet, match) => { return snippet + match }
      }
    }

  })
})


// --------------------------------------------------------------------------
//   Lint SCSS
// --------------------------------------------------------------------------

// Depends on gem install scss_lint scss_lint_reporter_checkstyle

gulp.task('lint-styles', () => {

  return gulp.src( [ config.styles + '/**/*.scss', '!' + config.styles + '/**/_print.scss' ] )
    .pipe( plugins.scssLint({
      config: '.scss-lint-config.yml',
      reporterOutputFormat: 'Checkstyle',
    }))
})


// --------------------------------------------------------------------------
//   Compile SCSS into CSS stylesheet
// --------------------------------------------------------------------------

gulp.task('styles', () => {

  return gulp.src( config.styles + '/main.scss' )
    .pipe( plugins.plumber() )
    .pipe( plugins.cssGlobbing({
      extensions: ['.css', '.scss']
    }))
    .pipe( plugins.sass({
      style: 'expanded',
      quiet: true,
      sourcemap: true,
      sourcemapPath: './',
      includePaths: [ config.vendor ]
    })
    .on( 'error', plugins.sass.logError) )
    .pipe( plugins.groupCssMediaQueries() )
    .pipe( plugins.autoprefixer("last 3 version", "> 1%", "ie 8", "ie 7") )
    .pipe( plugins.rename('styles.css') )
    .pipe( gulp.dest(config.styles) )
    .pipe( reload({stream:true}) )
})


// --------------------------------------------------------------------------
//   Minify CSS stylesheet
// --------------------------------------------------------------------------

gulp.task('compress-styles', ['styles'], () => {

  return gulp.src( config.styles + '/styles.css' )
    .pipe( plugins.plumber() )
    .pipe( plugins.cssnano() )
    .pipe( gulp.dest(config.styles) )
})


// --------------------------------------------------------------------------
//   Concat all user script files required into `global.js`
// --------------------------------------------------------------------------

gulp.task('scripts', () => {

  var scripts = mainBowerFiles( { filter: /.*\.js$/i } )

  scripts.push( config.scripts + '/utilities/*.js', config.scripts + '/modules/*.js' )

  return gulp.src( scripts )
    .pipe( plugins.plumber() )
    .pipe( plugins.sourcemaps.init() )
    .pipe( plugins.babel({
      presets: ['latest']
    }))
    .pipe( plugins.order( ['*jquery.js*', '*angular.js*', 'module.init.js'] ) )
    .pipe( plugins.concat('global.js') )
    .pipe( plugins.sourcemaps.write( '.' ) )
    .pipe( gulp.dest( config.scripts ) )
})


// --------------------------------------------------------------------------
//   Minify `global.js`
// --------------------------------------------------------------------------

gulp.task('compress-scripts', ['scripts'], () => {

  return gulp.src( config.scripts + '/global.js' )
    .pipe( plugins.plumber() )
    .pipe( plugins.uglify({
      mangle: true,
      compress: true,
      preserveComments: false
    }))
    .pipe( gulp.dest( config.scripts ) )
})


// --------------------------------------------------------------------------
//   Optimise all images
// --------------------------------------------------------------------------

gulp.task('images', () => {

  return gulp.src([
      config.images + "/*",
      config.images + "/**/*"] )
    .pipe( plugins.plumber() )
    .pipe( plugins.imagemin({
      optimizationLevel: 5,
      progressive: true
    }))
    .pipe( gulp.dest(config.images) )
})


// --------------------------------------------------------------------------
//   Compile Fonts
// --------------------------------------------------------------------------

gulp.task('icons', () => {

  gulp.src( [ config.icons + '/svg/*.svg'] )
    .pipe( plugins.iconfont({
      fontName: 'icons',
      fontHeight: 150,
      normalize: true,
      descent: 0
    }))
    .on('glyphs', (glyphs, options) => {

      var options = {
            glyphs: glyphs,
            fontName: 'icons',
            fontPath: '../icons/font/',
            className: 'icon'
          }

      gulp.src( config.icons + '/templates/icons.scss' )
        .pipe( plugins.consolidate('lodash', options) )
        .pipe( plugins.rename('_icons.scss') )
        .pipe( gulp.dest( config.styles + '/base/') )

      gulp.src( config.icons + '/templates/icons.css' )
        .pipe( plugins.consolidate('lodash', options) )
        .pipe( plugins.rename('icons.css') )
        .pipe( gulp.dest( config.icons + '/css/') )

      gulp.src( config.icons + '/templates/icons.html' )
        .pipe( plugins.consolidate('lodash', options) )
        .pipe( gulp.dest( config.icons + '/demo/') )

    })
    .pipe( gulp.dest( config.icons + '/font/') )
})


// --------------------------------------------------------------------------
//   Watch
// --------------------------------------------------------------------------

gulp.task('watch', () => {

  plugins.watch( config.styles + '/**/*.scss', () => {
    gulp.start('styles')
  })

  plugins.watch( ['./bower.json', config.scripts + '/**/*.js', '!' + config.scripts + '/global.js'], () => {
    gulp.start('scripts')
  })

})


gulp.task('watch-build', () => {

  plugins.watch( config.styles + '/**/*.scss', () => {
    gulp.start('compress-styles')
  })
  plugins.watch( ['./bower.json', config.scripts + '/**/*.js'], () => {
    gulp.start('compress-scripts')
  })

})


// --------------------------------------------------------------------------
//   Run development level tasks, and watch for changes
// --------------------------------------------------------------------------

gulp.task('default', [ 'styles', 'scripts', 'browser-sync', 'watch'])


// --------------------------------------------------------------------------
//   Run production tasks including minfication, and without watch
// --------------------------------------------------------------------------

gulp.task('build', [ 'compress-styles', 'compress-scripts' ])
