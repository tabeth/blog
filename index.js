var Metalsmith  = require("metalsmith");
var layouts     = require("metalsmith-layouts");
var permalinks  = require("metalsmith-permalinks");
var collections = require("metalsmith-collections");
var serve       = require("metalsmith-serve");
var watch       = require("metalsmith-watch");
var drafts      = require("metalsmith-drafts");
var dateFormat  = require("metalsmith-date-formatter");
var moment      = require("moment");
var inPlace     = require("metalsmith-in-place");
var marked      = require("marked");
var _           = require("lodash");
var rootPath    = require('metalsmith-rootpath')
var when        = require('metalsmith-if');

var templateConfig = {
  engineOptions: {
    root: "./",
    filters: {
      formatDate: function(date, format) {
          return moment(date).format(format);
      },
      notEqual: function(a, b, options) {
        return a !== b ? options.fn(this) : options.inverse(this);
      },
      get: function(object, key) {
        return object[key]
      },
      keys: function(object) {
        return Object.keys(object)
      }
    },
    extensions: {
    },
    globals: {
      marked: function() {
        var myMarked = marked;
        // Read file from rendered file for each layout;
        var renderedFilename = this.ctx.filename.replace(/\.(\w+)/, ".js");
        var myRendered = marked.Rendered;

        try {
          myRendered = require(renderedFilename);
          myRendered = _.assign(new marked.Renderer(), myRendered);
          myMarked.setOptions({
            renderer: myRendered
          })
        } catch(e) {
        }

        return myMarked;
      }
    }
  }
}

Metalsmith(__dirname)
  .metadata({
    title: "tabeth",
    description: "Education, tech, and sometimes both simultaneously.",
    generator: "Metalsmith",
    url: "http://www.tabeth.com",
    colors: {
      tech: '#c22326',
      ed: '#f37338',
      other: '#027878',
      reviews: '#fdb632',
      projects: '#801638'
    }
  })
  .use(dateFormat({ dates: 'date' }))
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(drafts())
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true,
      pattern: ['**/*.njk', '!about.njk', '!ed.njk', '!index.njk', '!other.njk', '!projects.njk', '!reviews.njk', '!tech.njk'],
      limit: 50,
    },
    tech: {
      sortBy: 'date',
      reverse: true,
      pattern: 'tech/*.njk'
    },
    ed: {
      sortBy: 'date',
      reverse: true,
      pattern: 'ed/*.njk'
    },
    other: {
      sortBy: 'date',
      reverse: true,
      pattern: 'other/*.njk'
    },
    reviews: {
      sortBy: 'date',
      reverse: true,
      pattern: 'reviews/*.njk',
    },
    projects: {
      sortBy: 'date',
      reverse: true,
      pattern: 'projects/*.njk'
    },
  }))

  .use(inPlace(templateConfig))
  .use(permalinks())
  .use(layouts({
    engine: "nunjucks",
    directory: "./layouts"
  }))
  .use(when(!process.env.PRODUCTION_BLOG,
    serve({
      port: 8000,
      verbose: true
    })
  ))
  .use(when(!process.env.PRODUCTION_BLOG,
    watch({
      livereload: !process.env.PRODUCTION_BLOG,
      paths: {
        "${source}/**/*": true,
        "layout/**/*": "**/*",
      }
    })
  ))
  .build(function(err, files) {
    if (err) { throw err; }
  });
