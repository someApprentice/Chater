const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

const config = {
  entry: path.resolve(__dirname, './src/index.tsx'),
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.tsx?$/,
        use: [ 'babel-loader', 'ts-loader' ],
        exclude: /node_modules/
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      filename: path.resolve(__dirname, './build/index.html'),
      publicPath: ''
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__dirname, './public'),
          globOptions: { ignore: [ '**/index.html' ] }
        }
      ]
    }),
    new Dotenv()
  ],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, './build/static'),
  }
};

if (!isProduction()) {
  config.devtool = 'inline-source-map';

  config.module.rules.push(
    {
      test: /\.js$/,
      enforce: 'pre',
      use: 'source-map-loader'
    }
  );
}

module.exports = config;
