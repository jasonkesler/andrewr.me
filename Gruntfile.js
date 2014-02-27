var path = require('path');

module.exports = function(grunt) {
  const asset_dir = '_assets';
  const build_dir = 'dist';

  function path_from_type(asset) {
    const path_map = {
      'css': 'css',
      'scss': 'sass',
      'js': 'js'
    };
    const default_path = 'assets';

    var type = path.extname(asset).substr(1);
    var type_path = (function() {
      if (path_map[type])
        return path_map[type];
      else
        return default_path;
    })();
    return type_path ? path.join(type_path, asset) : asset;
  }

  function asset_path(asset) {
    return path.join(asset_dir, path_from_type(asset));
  }
  function build_path(asset) {
    return path.join(build_dir, asset);
  }
  
  // Load all NPM grunt tasks
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      scripts: [
        asset_path('**/*.js')
      ],
      styles: [
        asset_path('**/*.scss'),
        asset_path('**/*.css')
      ]
    },

    // Combine JS modules using Browserify
    browserify: {
      options: {
        shim: {
          jquery: {path: asset_path('vendor/jquery.js'), exports: '$'},
        }
      },
      debug: {
        src: [asset_path('main.js')],
        dest: build_path('app.js'),
        options: {
          debug: true
        }
      },
      build: {
        src: [asset_path('main.js')],
        dest: build_path('app.js')
      }
    },

    // Compile Sass files to CSS
    compass: {
      options: {
        sassDir: path.join(asset_dir, 'sass'),
        cssDir: build_dir
      },
      debug: {
        options: {
          // For source maps
          debugInfo: true,
          outputStyle: 'expanded'
        }
      },
      build: {}
    },

    // Concatenate files
    concat: {
      build: {
        src: [asset_path('*.css'), build_path('main.css')],
        dest: build_path('style.css')
      }
    },

    // Minify CSS files
    cssmin: {
      build: {
        src: [build_path('style.css')],
        dest: build_path('style.min.css')
      }
    },

    // Minify JS files
    uglify: {
      build: {
        src: [build_path('app.js')],
        dest: build_path('app.min.js')
      }
    },

    copy: {
      assets: {
        expand: true, 
        cwd: asset_dir, 
        src: ['assets/**'], 
        dest: build_dir
      },
      vendor: {
        expand: true, 
        cwd: path.join(asset_dir, 'js'), 
        src: ['vendor/**'], 
        dest: build_dir
      },
    },

    // Clean target directories
    clean: {
      build: [build_dir],
      temp: { expand: true, cwd: build_dir, src: ['*.css', '!style*.css'] },
      all: [build_dir]
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
      build: {},
      production: {
        options: {
          config: '_config.yml',
          raw: 'production: true\n'
        }
      }
    },

    // Watch files for changes
    watch: {
      scripts: {
        files: ['<%= meta.scripts %>'],
        tasks: ['browserify:debug']
      },
      styles: {
        files: ['<%= meta.styles %>'],
        tasks: ['compass:debug', 'concat:build']
      },
      assets: {
        files: [path.join(asset_dir, 'assets/**/*')],
        tasks: ['copy:assets']
      },
      livereload: {
        // everything is regenerated on build, so we only need to watch one file
        files: ['_site/index.html'],
        options: { livereload: true, debounceDelay: 1000 }
      }
    },

    concurrent: {
      watch: {
        tasks: ['jekyll:server', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });
  
  // Compile JS & CSS, run watch to recompile on change
  grunt.registerTask('debug', function() {
    grunt.task.run([
      'clean:build',
      'compass:debug',
      'browserify:debug',
      'concat:build',
      'copy',
      'clean:temp'
    ]);
    // Watch for changes
    grunt.task.run('concurrent:watch');
  });

  // Run Jekyll build with environment set to production
  grunt.registerTask('jekyll-production', function() {
    grunt.task.run('jekyll:production');
  });

  // Compile and minify JS & CSS, run Jekyll build for production 
  grunt.registerTask('build', [
    'clean:all',
    'compass:build',
    'browserify:build',
    'concat:build',
    'cssmin',
    'uglify',
    'copy',
    'clean:temp',
    'jekyll-production'
  ]);

  grunt.registerTask('default', ['debug']);
};