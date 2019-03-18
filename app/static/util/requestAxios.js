import axios from 'axios';
import qs from 'qs';

// 多次请求时取消上一次请求
let pending = [];
const cancelPending = (config) => {
  if(config && pending.length > 0) {
    pending.forEach((item, index) => {
      if (item.url === config.url) {
        item.Cancel() // 取消请求
        pending.splice(index, 1) // 移除当前请求记录
      };
    })
  } else {
    pending.push({
      url: config.url,
    })
  }
}

// 创建实例
const instance = axios.create({
  // baseURL: API_BASEURL,
  timeout: 5000,
});

// 请求拦截
instance.interceptors.request.use(
  config => {
    // 添加token
    const token = localStorage.getItem("token");
    if(token) {
      config.withCredentials = true;
      config.headers.Authorization = token;
    }

    cancelPending(config);

    // 请求参数序列化
    if (config.method === 'post' || config.method === "put" || config.method === "delete") {
        config.data = qs.stringify(config.data)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
        return Promise.resolve(response.data);
    }
    return Promise.reject(response);
  },
  (error) => {
    // 根据返回的状态码相应操作，如错误提示等等
    // switch (error.response.status) {
    //   case 401:
    //       console.log('未登录');
    //       break;
    //   case 404:
    //       console.log('页面不存在');
    //       break;
    //   default: console.log(error.response.data.message);
    // }

    return Promise.reject(error);
  },
)

export default {
  get: (url, params) => instance.get(url, { params }),
  post: (url, data) => instance.post(url, { data }),
  put: (url, data) => instance.put(url, { data }),
};

