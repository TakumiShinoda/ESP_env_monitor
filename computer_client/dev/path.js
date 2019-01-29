const path = require('path');

module.exports = {
  srcPath: {
    js: (file) => {
      // return path.resolve(__dirname, '../src/assets/javascript') + file;
      return __dirname + '../src/assets/javascript' + file;
    },
    entries: (file) => {
      return path.resolve(__dirname, '../src/entries') + file;
    },
    images: (file) => {
      return path.resolve(__dirname, '../src/assets/images') + file;
    }
  },
  distPath: {
    bundle: (file) => {
      return path.resolve(__dirname, '../dist/bundles') + file;
    },
    images: (file) => {
      return path.resolve(__dirname, '../dist/images') + file;
    },
    js: (file) => {
      return path.resolve(__dirname, '../dist/js') + file;
    },
    views: (file) => {
      return path.resolve(__dirname, '../dist/views') + file;
    },
  }
}
