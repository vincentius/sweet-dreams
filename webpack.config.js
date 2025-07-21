const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/app.[contenthash].js',
    publicPath: '/sweet-dreams/',
    clean: true
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index-template.html',
      filename: 'index.html',
      inject: 'body'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/css', to: 'css' },
        { from: 'src/icons', to: 'icons' },
        { from: 'src/pages', to: 'pages' },
        { from: 'src/js/history.js', to: 'js/history.js' },
        { from: 'src/sw.js', to: 'sw.js' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'node_modules/framework7/framework7-bundle.min.css', to: 'lib/framework7-bundle.min.css' },
        { from: 'node_modules/framework7/framework7-bundle.min.js', to: 'lib/framework7-bundle.min.js' },
        { from: 'node_modules/framework7-icons/css/framework7-icons.css', to: 'lib/framework7-icons.css' },
        { from: 'node_modules/framework7-icons/fonts', to: 'fonts' }
      ]
    })
  ]
};