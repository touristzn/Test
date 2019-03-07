const path = require('path');

const koa = require('koa');
const staticServe = require('koa-static')
const onerror = require('koa-onerror')
const views = require('koa-views')
const proxy = require('koa-proxy')
const connectHistory = require('koa-connect-history-api-fallback')

const config = require('../config/server/env.conf');
const define = require('../config/define.conf');

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV !== 'production';

// new app
const app = new koa();

onerror(app);

if (NODE_ENV === 'development') {
  app.use(connectHistory({
    path: /^\//
  }))
}

if (isDev) {
  const webpack = require('webpack');
  const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware')
  const webpackConfig = require('../build/webpack.dev.config');
  const compiler = webpack(webpackConfig);

  Object.keys(webpackConfig.entry).forEach(function (key) {
    let val = webpackConfig.entry[key];
    val.unshift('webpack-hot-middleware/client')
    val.unshift('react-hot-loader/patch')
  });

  app.use(devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
    noInfo: false
  }))

  app.use(hotMiddleware(compiler, {
    log: console.log
  }));
}

app.use(staticServe(path.join(__dirname, '../dist')));
app.use(views(path.join(__dirname, '../dist'), {
  extension: 'html'
}));

//请求代理
app.use(proxy({
  host: define.API_BASEURL,
  match: /^\/api\//,
  map: function (path) {
    return path.replace('/api', '')
  }
}));

app.use(async (ctx, next) => {
  const start = new Date();
  const ms = new Date() - start;
  await next();
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

if (NODE_ENV !== 'development') {
  app.use(async (ctx) => {
    await ctx.render('index.html');
  });
}

// 开启监听服务
const server = app.listen(config.port);
console.log(`Please visit http://127.0.0.1:${config.port}`);