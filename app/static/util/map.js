import {isIphoneX} from './functions.js'

//自定义样式
export let myStyleJson = [
  {
      "featureType": "all",
      "elementType": "all",
      "stylers": {
          "lightness": 10,
          "saturation": -100
      }
  },
  {
      "featureType": "subway",
      "elementType": "labels.icon",
      "stylers": {
          "visibility": "off"
      }
  },
  {
      "featureType": "highway",
      "elementType": "all",
      "stylers": {
          "visibility": "off"
      }
  },
  {
      "featureType": "building",
      "elementType": "labels.icon",
      "stylers": {
          "visibility": "on"
      }
  },
  {
      "featureType": "water",
      "elementType": "labels.icon",
      "stylers": {
          "visibility": "off"
      }
  },
  {
      "featureType": "poilabel",
      "elementType": "labels.icon",
      "stylers": {
          "visibility": "off"
      }
  }
];

// 添加定位控件_返回用户位置
export function panToUserLocation(point, zoom){
  this.point = point;
  this.zoom = zoom;
  // 默认控件位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;

  if(isIphoneX){
    this.defaultOffset = new BMap.Size(15, 74);
  }else{
    this.defaultOffset = new BMap.Size(15, 50);
  }
}
panToUserLocation.prototype = new BMap.Control();
panToUserLocation.prototype.initialize = function(map){
  let self = this;
  // 保存map对象实例
  this._map = map;
  //创建元素
  let node = document.createElement("a");
  node.setAttribute("class","spaces-icon userLocation");
  node.innerHTML = '<img src="images/spaces/spaces_map_icon_localize.svg" />'
  // 绑定事件
  node.onclick = function(e){
    node.innerHTML = '<img src="images/spaces/spaces_map_icon_locality.svg" />';
    setTimeout(()=>{
      map.setZoom(self.zoom);
      map.panTo(self.point);
      window._tracking('Space','Map_Click', 'Initialization');
      node.innerHTML = '<img src="images/spaces/spaces_map_icon_localize.svg" />';
    },1000)
  }
  // 添加DOM元素到地图中
  map.getContainer().appendChild(node);
  // 将DOM元素返回
  return node;
}

//更改定位图标的图片
export function resetUserLocationImg(){
  let userLocation = document.querySelector(".userLocation");

  if(userLocation != null && userLocation.innerHTML.indexOf('spaces_map_icon_localize') == -1){
    userLocation.innerHTML = '<img src="images/spaces/spaces_map_icon_localize.svg" />'
  }
}

// 自定义覆盖物
export function ComplexCustomOverlay(point, text, id, index, args={}){
  this._point = point;
  this._text = text;
  this._index = index;
  this._id = id;
  this._click = args.click || (() => {});
}

ComplexCustomOverlay.prototype = new BMap.Overlay();
ComplexCustomOverlay.prototype.initialize = function(map) {
  // 保存map对象实例
  this._map = map;
  // 创建div元素，作为自定义覆盖物的容器
  let div = this._div = document.createElement("div");
  let html = '';
  html += '<div class="content">';
  html += '<span>' + this._text + '</span>';
  html += '</div>'

  div.className = "spaceCourses" + " " + "map-loc" + this._index;
  div.id = this._id;
  div.innerHTML = html;
  div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);

  //falg判断是滑动还是点击
  let falg = false;

  if (navigator.userAgent.match(/mobile/i)) {
    div.addEventListener('touchstart',() => {
      falg = false;
    })
    div.addEventListener('touchmove',() => {
      falg = true;
    })
    div.addEventListener('touchend',(e) => {
      if(!falg){
        this._click();
      }
    })
  }else{
    div.addEventListener('click', () => {
      this._click();
    })
  }

  map.getPanes().labelPane.appendChild(div);
  return div;
}
ComplexCustomOverlay.prototype.draw = function(){
  let map = this._map;
  let pixel = map.pointToOverlayPixel(this._point);
  this._div.style.left = pixel.x - 56 + "px";  //56为覆盖物尺寸
  this._div.style.top = pixel.y - 56 + "px";
}

//根据经纬度计算缩放级别
export function getZoom (map,maxLng,maxLat,minLng,minLat) {
  //级别18到3
  let zoom = ["50","100","200","500","1000","2000","5000","10000","20000","25000","50000","100000","200000","500000","1000000","2000000"]

  let pointA = new BMap.Point(maxLng,maxLat);  // 创建点坐标A
  let pointB = new BMap.Point(minLng,minLat);  // 创建点坐标B
  let distance = map.getDistance(pointA,pointB);  //获取两点距离,保留小数点后两位

  for (let i = 0,zoomLen = zoom.length; i < zoomLen; i++) {
      if(zoom[i] - distance > 0){
          return 18-i+3;  //加3是因为地图等级是从3开始
      }
  }
}

//删除指定覆盖物
export function deleteMarker(map,data){
	let allOverlay = map.getOverlays();
	for (let i = 0; i < allOverlay.length; i++){
    if(!allOverlay[i].Mb){ //判断是否是自定义覆盖物，只删除自定义覆盖物
      for(let j = 0; j < data.length; j++){
        if(data[j].locationId != allOverlay[i]._id){
          map.removeOverlay(allOverlay[i]);
          return false;
        }
      }
    }
	}
}
