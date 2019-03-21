import axios from 'axios';
import qs from 'qs';

// 创建实例
const instance = axios.create({
  // baseURL: API_BASEURL,
  timeout: 5000,
});


// axios内置的中断ajax的方法
const cancelToken = axios.CancelToken;
// 请求队列
let queue = [];
// 拼接请求的url和方法，同样的url+方法可以视为相同的请求
const currentReq = (config) =>{
  return `${config.url}_${config.method}`
}
// 中断重复的请求，并从队列中移除
const removeQueue = (config) => {
  for(let i=0, size = queue.length; i < size; i++){
    const task = queue[i];
    if(task.req === currentReq(config)) {
      task.cancel();
      queue.splice(i, 1);
    }
  }
}

// 请求拦截
instance.interceptors.request.use(
  config => {
    // 中断之前的同名请求
    removeQueue(config);
    // 添加cancelToken
    config.cancelToken = new cancelToken(c => {
      queue.push({ req: currentReq(config), cancel: c });
    });

    // 添加token
    const token = localStorage.getItem("token");
    if(token) {
      config.withCredentials = true;
      config.headers.Authorization = token;
    }

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
        // 在请求完成后，自动移出队列
        removeQueue(response.config);
        
        return Promise.resolve(response);
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

