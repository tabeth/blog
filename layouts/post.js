
module.exports = {
  blockquote: function (text) {
    return `<blockquote class='f6 f5-ns i pl4 bl bw1 b--color mb4'>${text}</blockquote>`;
  },

  paragraph: function(text) {
    return `<p class='f5 f4-ns lh-copy measure mb4'>${text}</p>`
  }

}
