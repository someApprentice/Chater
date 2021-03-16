const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const { EnvironmentPlugin } = require('webpack');

require('dotenv').config();

module.exports = {
  entry: resolve(__dirname, './server/index.tsx'),
  mode: process.env.NODE_ENV || 'development',
  target: 'node',
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: 'css-loader'
      },
      {
        test: /\.tsx?$/,
        use: [ 'babel-loader', 'ts-loader' ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new EnvironmentPlugin([ 'TITLE', 'SECRET' ])
  ],
  output: {
    filename: 'server.js',
    path: resolve(__dirname, 'build')
  }
};
