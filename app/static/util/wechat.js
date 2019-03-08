import axios from 'axios'
import {browser} from './functions'
import {__} from '../static/js/i18n'
import cookie from 'react-cookie';
import getUrl from '../utils/getUrl';

let wxUtils = {}, getConfigTra = null,
    historyUrl = null, currentUrl;

//-------------------微信工具暴露的方法-------------------

//获取分享内容并分享给好友和朋友圈
wxUtils.getShare = function(shareInfo) {
    //默认分享内容
    let defaultShareContent = {
      toFriendTitle: 'BULA',
      toTimelineTitle: __('加入BULA，解放你的运动场!'),
      description: __('解放你的运动场'),
      link: Login.appDomain + 'index.html?_from=share',
      imgUrl: 'https://bula.static.luoxin.com/common/logo_bula.png'
    }

    let shareContent = shareInfo || defaultShareContent;

    if (!getConfigTra && browser.iPhone) {
      getConfigTra = getConfig();
    } else {
      getConfigTra = getConfig();
    }

    getConfigTra.then(() => {
      share.init(shareContent);
    }).catch(error=>{
      console.log(error)
    })

}

//获取地理位置接口
wxUtils.getLocation = function(){
  if (!getConfigTra) {
    getConfigTra = getConfig();
  }

  return getConfigTra;
}

//使用微信内置地图查看位置接口
wxUtils.openLocation = function(map){
    wx.openLocation({
      latitude: map.latitude || '', // 纬度，浮点数，范围为90 ~ -90
      longitude: map.longitude || '', // 经度，浮点数，范围为180 ~ -180。
      name: map.name || '', // 位置名
      address: map.address || '', // 地址详情说明
      scale: map.scale || 17, // 地图缩放级别,整形值,范围从1~28。默认为最大
      infoUrl: map.infoUrl || '' // 在查看位置界面底部显示的超链接,可点击跳转
    });
}

//隐藏底部菜单
wxUtils.disabledOptionMenu = function(){
  if (typeof WeixinJSBridge === "undefined") {
      if (document.addEventListener) {
          document.addEventListener('WeixinJSBridgeReady', onBridgeReady(true), false);
      } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', onBridgeReady(true));
          document.attachEvent('onWeixinJSBridgeReady', onBridgeReady(true));
      }
  } else {
      onBridgeReady(true);
  }
}
//显示底部菜单
wxUtils.openOptionMenu = function() {
    if (typeof WeixinJSBridge === "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady(false), false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady(false));
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady(false));
        }
    } else {
        onBridgeReady(false);
    }
}
//获取签名
function getConfig() {

    currentUrl = location.href;

    if(historyUrl == null){
      historyUrl = location.href;
    }

    return new Promise((resolve, reject) => {
        axios.get('https://wechat-api.luoxin.com/weChat/getJsConfig', {
          params: {
            appId: Login.appId,
            url: browser.android ? location.href : historyUrl
          }
        })
        .then((res) => {
          let data = res.data;
           wxConfig(res.data.result);
           resolve(res);
        })
        .catch((error) => {
            reject(error);
            console.log(error);
        })

        wx.error((res) => {
          console.log(res)
        })
    })
}


//-------------------定义微信分享-------------------
let share = {
    init(shareInfo) {
        this.title = shareInfo.title;
        this.toFriendTitle = shareInfo.toFriendTitle;
        this.toTimelineTitle = shareInfo.toTimelineTitle;
        this.description = shareInfo.description;
        this.link = this.shareUrlAddFall(shareInfo.link);
        this.imgUrl = shareInfo.imgUrl;

        wx.ready(() => {
          this.toFriend();
          this.toTimeline();
        })
    },

    toFriend() {
        wx.onMenuShareAppMessage({
            title: this.toFriendTitle || this.title,
            desc: this.description,
            link: this.link,
            imgUrl: this.imgUrl,
            success: function (data) {},
            fail: function (data) {}
        });
    },

    toTimeline() {
        wx.onMenuShareTimeline({
            title: this.toTimelineTitle || this.title,
            link: this.link,
            imgUrl: this.imgUrl,
            success: function (data) {},
            fail: function (data) {}
        });
    },
    //分享Url添加分享身份识别
    shareUrlAddFall(link) {
      if (!link) {
        return '';
      }
      /**根据userLoginReferCode判断用户是否登陆**/
      let userLoginReferCode = cookie.load("userLoginReferCode"),
          origin = cookie.load("origin"),
          shareReferCode = cookie.load('shareReferCode');

      if (!origin && shareReferCode) {
        userLoginReferCode = shareReferCode;
      }

      if(!userLoginReferCode){
        return '';
      }

      let shareUserType = (getUrl('userType') == 'student' ? 'sShare' : 'tShare'),
          addUrlParameter = 'loginType=' + shareUserType + '&shareReferCode=' + userLoginReferCode;

      if (link.indexOf('?') != -1) {//如果地址栏后面有跟参数
        link = link + '&' + addUrlParameter;
      } else {//如果地址栏没有参数
        link = link + '?' + addUrlParameter;

      }
      return link;
    }
}

//-------------------获取签名和权限-------------------
function wxConfig(config) {
  wx.config({
    debug: false,
    appId: config.appId,
    timestamp: config.timestamp,
    nonceStr: config.nonceStr,
    signature: config.signature,
    jsApiList: [
      'onMenuShareTimeline',
      'onMenuShareAppMessage',
      'openLocation',
      'getLocation'
    ]
  })
}


//-------------------是否禁用或开启-------------------
function onBridgeReady(disable = true) {
    if (typeof WeixinJSBridge !== "undefined") WeixinJSBridge.call(disable ? 'hideOptionMenu' : 'showOptionMenu');
}

export default wxUtils;
