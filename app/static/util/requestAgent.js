import superagent from 'superagent';

// 请求队列
let queue = [];
// 中断重复的请求，并从队列中移除
const removeQueue = (config) => {
  for(let i=0, size = queue.length; i < size; i++){
    const task = queue[i];
    const taskUrl = task.url;
    const taskMethod = task.method;
    const configUrl = config.url;
    const configMethod = config.method;

    if(taskUrl === configUrl && taskMethod === configMethod) {
      task.abort();
      queue.splice(i, 1);
    }
  }
}

const apiAgent = superagent
  .agent()
  // 判断响应是否是错误
  .ok((res) => res.status >= 200 && res.status < 300)
  // 设置Accept
  .accept('json')
  // 超时时间
  .timeout(5000)
  // 请求拦截
  .use((request) => {
    // 多次请求时，取消上一次请求
    removeQueue(request);
    // 添加当前请求至queue数组
    queue.push(request);
    
    return request;
  })
  // 响应拉截
  .use((request) => {
    // 根据返回的状态码相应操作，如错误提示等等
    request.then(res => {
      // 在请求完成后，自动移出队列
      removeQueue(res.req);
    })

    return request;
  })

  export default {
    get: (url, params) => {
      return apiAgent
      .get(url)
      .query(params)
    },
    post: (url, params) => {
      return apiAgent
      .post(url)
      .type('json')  //json or form
      .send(params)
    },
    put: (url, params) => {
      return apiAgent
      .put(url)
      .type('json')
      .send(params);
    }
  }