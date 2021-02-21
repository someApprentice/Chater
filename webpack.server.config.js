const { resolve } = require('path');
const { EnvironmentPlugin } = require('webpack');

require('dotenv').config();

module.exports = {
  entry: resolve(__dirname, './server/index.tsx'),
  mode: process.env.NODE_ENV || 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [ 'babel-loader', 'ts-loader' ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: 'css-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new EnvironmentPlugin([ 'TITLE' ])
  ],
  output: {
    filename: 'server.js',
    path: resolve(__dirname, 'build')
  }
};
