import wxUtils from './wechat';

export default function getLocation() {
  return new Promise((resolve, reject) => {

    if (window.urlParams.weixin) {
      wxUtils.getLocation().then(() => {
        wx.ready(() => {
          wx.getLocation({
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: (res) => {
              res.device = 'wechat';
              resolve(res);
            },
            fail: (error) =>{
              reject(error)
            },
            cancel: (error) => {
              reject(error)
            }
          });
        })
      }).catch(error => {
        console.log(error)
      })

    }else{
      let geolocation = new BMap.Geolocation();

      geolocation.getCurrentPosition(function(res){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            res.device = 'BMap';
            console.log(res)
            resolve(res);
        }else {
          reject('定位失败');
          console.log('定位失败');
        }
      },{enableHighAccuracy: true})//指示浏览器获取高精度的位置，默认false
    }
  })
}
