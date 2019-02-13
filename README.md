## 命令行

- 安装依赖：`npm install`
- 安装插件：`npm run dll`
- 本地开发：`npm run dev`
- 发布发生：`npm run prod`

## 访问链接

- `http://localhost:8000`


## 目录

```
---
  |---- dist: 构建脚本
  |---- config: 配置文件
  |
  | |
  | |----components: 基础组件
  | |----containers: 页面
  | |----dll: 第三方库
  | |----entry: 入口js
  | |----fetch: 封装异步请求
  | |----router: 路由配置
  | |----static: 静态资源
  | |----template: 入口html，与entry一一对应
  | |----store: mobx配置
  | |
  |
  |---- server: node server 代码
---

```