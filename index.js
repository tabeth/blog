var Metalsmith  = require("metalsmith");
var layouts     = require("metalsmith-layouts");
var permalinks  = require("metalsmith-permalinks");
var collections = require("metalsmith-collections");
var serve       = require("metalsmith-serve");
var watch       = require("metalsmith-watch");
var drafts      = require("metalsmith-drafts");
var dateFormat  = require("metalsmith-date-formatter");
var handlebars  = require("handlebars");
var moment      = require("moment");
var assets      = require("metalsmith-static");
var inPlace     = require("metalsmith-in-place");
var marked      = require("marked");
var _           = require("lodash");
var rootPath    = require('metalsmith-rootpath')

handlebars.registerHelper('formatDate', function(date, format) {
  return moment(date).format(format);
});

handlebars.registerHelper('notEqual', function(a, b, options) {
  return a !== b ? options.fn(this) : options.inverse(this);
});

var templateConfig = {
  engineOptions: {
    root: "./",
    filters: {
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
  .clean(false)
  .use(drafts())
  .use(inPlace(templateConfig))
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true,
      pattern: ['**/*.md', '!about.md', '!ed.md', '!index.md', '!other.md', '!projects.md', '!reviews.md', '!tech.md'],
      limit: 50,
    },
    tech: {
      sortBy: 'date',
      reverse: true,
      pattern: 'tech/*.md'
    },
    ed: {
      sortBy: 'date',
      reverse: true,
      pattern: 'ed/*.md'
    },
    other: {
      sortBy: 'date',
      reverse: true,
      pattern: 'other/*.md'
    },
    reviews: {
      sortBy: 'date',
      reverse: true,
      pattern: 'reviews/*.md',
    },
    projects: {
      sortBy: 'date',
      reverse: true,
      pattern: 'projects/*.md'
    },
  }))
  .use(permalinks())
  .use(layouts({
    engine: "nunjucks",
    directory: "./layouts"
  }))
  .use(serve({
    port: 8000,
    verbose: true
  }))
  .use(watch({
    livereload: true,
    paths: {
      "${source}/**/*": true,
      "layout/**/*": "**/*",
    }
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });
