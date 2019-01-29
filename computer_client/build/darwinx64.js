const packager = require('electron-packager');
const package = require('../package.json');

packager({
    name: package['name'],
    dir: '.',
    out: '.',
    platform: 'darwin',
    arch: 'x64',
    version: '1.8.1',
    asar: false,
    ignore: [
      'gulpfile.js',
      'README.md',
      'build',
    ],
    'app-version': package['version'],
    'app-copyright': 'Copyright (C) 2017 '+package['author']+'.',
}, (err, appPaths) => {
    if (err) console.log(err);
    console.log('Done: ' + appPaths);
});
