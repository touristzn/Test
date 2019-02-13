/**
 * 配置不同环境的打包发布参数
 */

const APP_ENV = process.env.APP_ENV || 'local';
const configs = {};

// common
let common = {
  env: APP_ENV,
  port: '5001'
}

// local
configs['local'] = Object.assign({}, common, {
  port: '8001'
})

// it
configs['it'] = Object.assign({}, common, {
  // port: '8000'
})

// it
configs['uat'] = Object.assign({}, common, {
  // port: '8000'
})

// prod
configs['prod'] = Object.assign({}, common, {
  // port: '8000'
})

// module.exports
module.exports = configs[APP_ENV]
