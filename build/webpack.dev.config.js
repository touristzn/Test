const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')

module.exports = merge(baseWebpackConfig, {
  output: {
    filename: 'js/[name].[hash:5].js'
  },

  module: {
    rules: [
      {
        test: /\.less$/, //注意先后顺序
        use: [
          'style-loader',
          'css-loader',
          {//postcss需要放在less前
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: true,
              plugins: [
                require('postcss-preset-env')()
              ]
            }
          },
          'less-loader'
        ]
      }
    ]
  },

  plugins: [
    //定义环境变量,并且设置的process.env.NODE_ENV是全局变量，可以在页面中引用，
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
})