import 'babel-polyfill'   //使用async语法
import { observable, autorun, action, useStrict, runInAction } from 'mobx'
import { fetch } from '../request/agent'

useStrict(true);

export default class Home {
  @observable banners = []
  @observable loading = false

  constructor() {
    this.getBanners();
  }

  //函数中如果有异步调用并且在异步请求返回时需要修改应用状态，则需要对异步调用也使用 aciton 包裹。
  //当使用 async/await 语法处理异步请求时，可以使用 runInAction 来包裹你的异步状态修改过程。
  @action.bound
  init() {
    this.banners = [];
    this.loading = false
  }

  @action.bound
  async getBanners() {
    if (this.loading) return;
    this.init();
    
    const param = {
      platform: 'h5',
      uin: 0,
      needNewCode: 1
    }

    try {
      this.setLoading(true);
      const { data } = await fetch(param);

      runInAction(() => {
        this.banners = data.slider;
      });
    } catch (err) {
      console.log('获取数据失败')
    } finally {
      this.setLoading(false);
    }
  }

  @action.bound
  setLoading(val) {
    this.loading = val
  }
}
