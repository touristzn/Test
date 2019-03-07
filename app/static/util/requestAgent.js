import superagent from 'superagent';

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
    // set headers
    const token = localStorage.getItem("token");
    if(token) request.set('Authorization', token);

    return request;
  })
  // 响应拉截
  .use((request) => {
    // 根据返回的状态码相应操作，如错误提示等等
    request.then(res => {
      // console.log(res.status)
    })

    return request;
  })
  .on(error => {
    console.log(error)
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
      // .query({ appId: '111' })
      .send(params)
    },
    put: (url, params) => {
      return apiAgent
      .put(url)
      .type('json')
      .send(params);
    }
  }