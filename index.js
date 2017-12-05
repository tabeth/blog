var Metalsmith  = require("metalsmith");
var markdown    = require("metalsmith-markdown");
var marked      = require("marked");
var layouts     = require("metalsmith-layouts");
var permalinks  = require("metalsmith-permalinks");
var collections = require("metalsmith-collections");
var serve       = require("metalsmith-serve");
var watch       = require("metalsmith-watch");
var drafts      = require("metalsmith-drafts");
var dateFormat  = require("metalsmith-date-formatter");
var handlebars  = require("handlebars");
var moment      = require("moment");

handlebars.registerHelper('formatDate', function(date, format) {
  return moment(date).format(format);
});

Metalsmith(__dirname)
  .metadata({
    title: "tabeth",
    description: "Education, tech, and sometimes both simultaneously.",
    generator: "Metalsmith",
    url: "http://www.tabeth.com",
    colors: {
      tech: '#c22326',
      education: '#f37338',
      other: '#027878',
      reviews: '#fdb632',
      projects: '#801638'
    }
  })
  .use(dateFormat({ dates: 'date' }))
  .source('./src')
  .destination('./build')
  .clean(false)
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true,
      limit: 50,
      pattern: '*.md'
    },
    tech: {
      sortBy: 'date',
      reverse: true,
      pattern: '${source}/tech/*.md'
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
  .use(markdown({
    "renderer": () => {
      var renderer = new marked.Renderer({
        "smartypants": true,
        "smartLists": true,
        "gm": true,
        "tables": true,
        "breaks": false,
        "stanitize": false
      });

      renderer.blockquote = function(text) {
        return `<blockquote class='f6 f5-ns i pl4 bl bw1 b--color mb4'>${text}</blockquote>`;
      };

      renderer.paragraph = function(text) {
        return `<p class='f5 f4-ns lh-copy measure mb4'>${text}</p>`
      }

      return renderer;

    }()

  }))
  .use(permalinks())
  .use(drafts())
  .use(layouts({
    engine: 'handlebars',
    directory: './layouts',
    default: 'layout.html',
    pattern: ["*/*/*html", "*/*html", "*html"],
    partials: {
      nav: 'partials/nav'
    }
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
