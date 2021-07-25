const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: {import: './src/popup/popup.ts', filename:'popup/[name].js'},
    background: {import: './src/background.ts', filename:'[name].js'},
    options: {import: './src/options/options.ts', filename:'options/[name].js'},
    contentScript: {import: './src/contentScript/contentScript.ts', filename:'contentScript/[name].js'},
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }], // do not forget to change/install your own TS loader
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({ template: 'src/popup/popup.html', filename:'popup/popup.html', inject:false }),
    new HtmlWebpackPlugin({ template: 'src/options/options.html', filename:'options/options.html', inject:false }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/images/get_started16.png', to:'images' },
        { from: './src/images/get_started32.png', to:'images' },
        { from: './src/images/get_started48.png', to:'images' },
        { from: './src/images/get_started128.png', to:'images' }
      ],
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }, // chrome will look for files under dist/* folder
};