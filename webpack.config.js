const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'app-client.js'),
  mode: "production",
  output: {
    path: path.join(__dirname, 'public', 'js'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: path.join(__dirname, 'src'),
        loader: 'babel-loader',
        query: {
          cacheDirectory: 'babel_cache',
          presets: ['react', 'env', 'stage-2']
        }
      },
      { 
        test: /\.css$/, 
        loader: "style-loader!css-loader" 
      }
    ]
  }
};