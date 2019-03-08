//判断访问终端
export const browser = (function(){
  let u = navigator.userAgent;
  return {
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), /*是否为移动终端*/
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), /*ios终端*/
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, /*android终端或者uc浏览器*/
      iPhone: u.indexOf('iPhone') > -1 , /*是否为iPhone或者QQHD浏览器*/
      weixin: u.toLowerCase().indexOf('micromessenger') > -1, /*是否是微信*/
      nakedHubApp: u.indexOf('nakedHub') > -1 /*是否为hubApp*/
  }
})()

//判断是否为iphoneX
export const isIphoneX = (function(){
    return /iphone/gi.test(navigator.userAgent) && (screen.height == 812 && screen.width == 375)
})()