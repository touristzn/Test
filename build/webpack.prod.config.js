const webpack = require('webpack')
const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')

const path = require('path')

module.exports = merge(baseWebpackConfig, {
  output: {
    filename: 'js/[name].[chunkhash:5].js'
  },

  module: {
    rules: [
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {//postcss需要放在less前
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                sourceMap: true,
                plugins: [
                  require('postcss-cssnext')()
                ]
              }
            },
            'less-loader'
          ]
        })
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: false,
      parallel: true,
      cache: true
    }),

    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),

    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(['dist'],{
      root: path.resolve(__dirname, '../'),
   }),

    new ExtractTextPlugin({
      filename: 'css/[name].[contentHash:5].css',
      allChunks: false
    })
  ]
})