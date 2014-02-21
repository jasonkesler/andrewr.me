module.exports = function(grunt) {
  const asset_path = ''; //'_assets';
  
  // Load all NPM grunt tasks
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      scripts: [
        asset_path + 'js/**/*.js'
      ],
      styles: [
        asset_path + 'sass/**/*.scss',
        asset_path + 'css/**/*.css'
      ]
    },

    // Combine JS modules using Browserify
    browserify: {
      options: {
        // Shim 3rd party libraries not in `node_modules`
        shim: {
          'modernizr': {path: 'js/vendor/modernizr.js', exports: 'modernizr'},
          'jquery': {path: 'js/vendor/jquery.js', exports: 'jquery'}
          // 'jquery': {path: 'bower_components/jquery/jquery.js', exports: 'jQuery'},
          // // 'fastclick': {path: 'bower_components/fastclick/lib/fastclick.js', exports: 'jQuery'},
          // 'jquery-jail': {path: 'bower_components/JAIL/src/jail.js', exports: 'jail'}
        }
      },
      debug: {
        src: ['app/main.js'],
        dest: 'debug/app.js',
        options: {
          debug: true
        }
      },
      build: {
        src: ['app/main.js'],
        dest: 'build/app.js'
      }
    },

    // Compile Sass files to CSS
    compass: {
      options: {
        // require: 'compass-inuit',
        sassDir: 'sass'
      },
      debug: {
        options: {
          cssDir: 'debug',
          // For source maps
          debugInfo: true,
          outputStyle: 'expanded'
        }
      },
      build: {
        options: {
          cssDir: 'build'
        }
      }
    },

    // Concatenate files
    concat: {
      debug: {
        files: {
          'debug/style.css': ['css/*.css', 'debug/main.css']
        }
      },
      build: {
        files: {
          'build/style.css': ['css/*.css', 'build/main.css']
        }
      }
    },

    // Minify CSS files
    cssmin: {
      build: {
        files: {
          'build/style.min.css': ['build/style.css']
        }
      }
    },

    // Minify JS files
    uglify: {
      build: {
        files: {
          'build/app.min.js': ['build/app.js']
        }
      }
    },

    // Watch files for changes
    watch: {
      scripts: {
        files: ['<%= meta.scripts %>'],
        tasks: ['browserify2:debug']
      },
      styles: {
        files: ['<%= meta.styles %>'],
        tasks: ['compass:debug', 'concat:debug']
      }
    },

    // Clean target directories
    clean: {
      debug: ['debug'],
      buildTemp: [
        'build/main.css',
        'build/style.css',
        'build/app.js'
      ],
      all: ['debug', 'build']
    },

    // Run Jekyll commands
    jekyll: {
      server: {
        options: {
          serve: true,
          // Add the --watch flag, i.e. rebuild on file changes
          watch: true
        }
      },
      build: {
        options: {
          serve: false
        }
      }
    }
  });

  // Compile JS & CSS, run watch to recompile on change
  grunt.registerTask('debug', function() {
    // Rebuild './debug'
    grunt.task.run([
      'clean:debug',
      'compass:debug',
      'browserify:debug',
      'concat:debug'
    ]);
    // Watch for changes
    grunt.task.run('watch');
  });

  // Alias to `grunt jekyll:server`
  grunt.registerTask('server', 'jekyll:server');

  // Run Jekyll build with environment set to production
  grunt.registerTask('jekyll-production', function() {
    grunt.log.writeln('Setting environment variable JEKYLL_ENV=production');
    process.env.JEKYLL_ENV = 'production';
    grunt.task.run('jekyll:build');
  });

  // Compile and minify JS & CSS, run Jekyll build for production 
  grunt.registerTask('build', [
    'clean:all',
    'compass:build',
    'browserify:build',
    'concat:build',
    'cssmin',
    'uglify',
    'clean:buildTemp',
    'jekyll-production'
  ]);

  grunt.registerTask('default', ['debug']);
};