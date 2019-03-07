/**
 * 用于配置 webpack.DefinePlugin
 */
const APP_ENV = process.env.APP_ENV || 'dev';
const NODE_ENV = process.env.NODE_ENV || 'development';
const defines = {};

// common
const common = {
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
}

// envs
const envs = {
  // dev
  dev: {
    API_BASEURL: 'https://c.y.qq.com',
  },
  // prod
  prod: {
    API_BASEURL: JSON.stringify('https://zuul-ut.nakedhub.com/'),
  },
}

module.exports = Object.assign({}, common, envs[APP_ENV]);