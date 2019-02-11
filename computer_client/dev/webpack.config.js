const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const {srcPath, distPath} = require('./path');

module.exports = {
  config: (routes) => {
    return {
      mode: 'development',
      target: 'electron-renderer',
      entry: './src/assets/typescript/' + routes + '/index.ts',
      output: {
        filename: routes + ".js"
      },
      plugins: [
        new HardSourceWebpackPlugin()
      ],    
      module: {
        rules: [
          {
            test: /\.css/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  url: false,
                  minimize: true,
                  sourceMap: true,
                },
              },
            ],
          },
          {
            test: /\.ts$/,
            use: 'ts-loader'
          }
        ]
      },
      node: {
        __dirname: false,
        __filename: false
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"]
      }
    };
  }
}
