import React, {Component} from 'react'
import moment from 'moment'
import {Link} from 'react-router-dom';
import {__} from '../../../static/js/i18n'
import {myStyleJson,panToUserLocation,resetUserLocationImg,
  ComplexCustomOverlay,getZoom,translateCallback,deleteMarker} from '../../../utils/map'
import {urlLang} from '../../../lang/lang'
import {dateSlider} from '../../../utils/dateSlider'
import {redirect} from '../../../utils/functions'
import getUrl from '../../../utils/getUrl'
import Loading from '../../../component/Loading'
import history from '../../../component/history'
import LocationCourseList from '../location-course-list/'
import './style.less'

//地图缩放级别 - 空间列表数据
let defaultZoom,getLocationData = [];

export default class SpacesMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      defaultPopup: true,
      spaceId: null,
      courseCount: 0,
      coursePopup: false,
      data:[],
      hasMore: false,
      isLoading: false,  //记录当前状态下，是“加载中”还是加载完成
      mapReminder_1: true,
      mapReminder_2: false
    }

    this.zoomData = [
      {distance:50, zoom:'18'},
      {distance:100, zoom:'17'},
      {distance:200, zoom:'16'},
      {distance:500, zoom:'15'},
      {distance:1000, zoom:'14'},
      {distance:2000, zoom:'13'},
      {distance:5000, zoom:'12'},
      {distance:10000, zoom:'11'},
      {distance:20000, zoom:'10'},
      {distance:25000, zoom:'9'},
      {distance:50000, zoom:'8'},
      {distance:100000, zoom:'7'},
      {distance:200000, zoom:'6'},
      {distance:500000, zoom:'5'},
      {distance:1000000, zoom:'4'},
      {distance:2000000, zoom:'3'}
    ]
  }

  componentWillMount(){
    let that = this;

    if(urlLang == "zh-CN"){
      moment.locale('zh-CN');
    }else{
      moment.locale('en');
    }

    if(localStorage.getItem('mapPopup') == "ok"){
      this.setState({defaultPopup: false})
    }

    if($('.classPopup')){
      $('.classPopup').on('swipedown',function(e){
        that.closeCoursePopup();
        e.preventDefault();
      })
    }
  }

  getLocation(data){
    getLocationData = data;

    let spacesListParam = this.props.spacesListParam,
      getLocations = this.props.getLocationsByDistance,
      courseParam = this.props.courseParam,
      getCourse = this.props.getCourseBySpace;

    dateSlider.init(spacesListParam,getLocations,courseParam,getLocationData);

    if (getUrl('rentSpace')) {
      this.checkWhetherTeacher()
    }

    this.map(spacesListParam.param.longitude, spacesListParam.param.latitude);
  }

  map(lng, lat) {
    //地图加载有先后顺序，请不要轻易更改位置
    let that = this,
      x = lng,
      y = lat,
      bm = new BMap.Map(this.refs.map),
      ggPoint = new BMap.Point(x, y),
      props = this.props,
      spacesListParam = props.spacesListParam;

    //根据经纬度计算缩放级别
    if(getLocationData.length > 0 && defaultZoom == undefined){

      //计算最大和最小经纬度
      let maxLng = getLocationData[0].longitude,
        maxLat = getLocationData[0].latitude,
        minLng = getLocationData[0].longitude,
        minLat = getLocationData[0].latitude;

      for (let i = 0; i < getLocationData.length; i++) {
        let currentLng = getLocationData[i].longitude,
          currentLat = getLocationData[i].latitude;

        currentLng > maxLng ? maxLng = currentLng : null;
        currentLat > maxLat ? maxLat = currentLat : null;
        currentLng < minLng ? minLng = currentLng : null;
        currentLat < minLat ? minLat = currentLat : null;
      }

      defaultZoom = getZoom(bm, maxLng, maxLat, minLng, minLat);

      //将缩放级别换算成公里并传给后台
      let zoomData = this.zoomData;

      for(let i=0; i < zoomData.length; i++){
        if(zoomData[i].zoom == defaultZoom){
          spacesListParam.param.distance = zoomData[i+3].distance;
        }
      }
    }

    //绘制覆盖物
    creatMarker(getLocationData);

    //自定义样式
    bm.setMapStyle({styleJson: myStyleJson});

    //加载地图时移除loading，显示图标
    bm.addEventListener("load", function (e){
      $('.popupLoading').remove();
      $('.centerAnchor,.switchList,.dateSlider').show();
    })

    //地图初始化
    bm.centerAndZoom(ggPoint, defaultZoom);

    //禁用双击放大
    bm.disableDoubleClickZoom();

    //添加点击事件
    bm.addEventListener("click", function(){
      //重置左下角定位图片
      resetUserLocationImg();
    })

    //设置用户所在位置图标
    let myIcon = new BMap.Icon("images/spaces/spaces_map_icon_myLocation.svg", new BMap.Size(30, 30)),
        marker = new BMap.Marker(ggPoint, {icon: myIcon});

    // 创建定位控件_返回用户位置
    let myPanToUserLocation = new panToUserLocation(ggPoint, defaultZoom);

    if (window.urlParams.weixin) {
      //坐标转换
      let convertor = new BMap.Convertor();
      let point = [];
      point.push(ggPoint);
      convertor.translate(point, 3, 5, translateCallback);
    }else{
      bm.addOverlay(marker);
      bm.addControl(myPanToUserLocation);
    }

    //添加地图移动开始事件
    bm.addEventListener("moveend", (e) => {
      let center = bm.getCenter();

      spacesListParam.param.longitude = center.lng;
      spacesListParam.param.latitude = center.lat;

      setTimeout(()=>{
        this.props.getLocationsByDistance(spacesListParam).then((item)=>{
          let data = item.payload.data,
              newData = [];

          if(data.error == null){
            for (let i=0; i < data.result.length; i++) {
              let newLocationId = data.result[i].locationId,
                  flag = false;

              for (let j=0; j < getLocationData.length; j++) {
                let oldLocationId = getLocationData[j].locationId;
                if(oldLocationId == newLocationId){
                  flag = true;
                  break;
                }
              }
              if(!flag){
                newData.push(data.result[i])
              }
            }

            getLocationData = getLocationData.concat(newData);

            //重新设置中心点
            bm.setCenter(center.lng, center.lat);
            //创建覆盖
            if(newData.length > 0){
              creatMarker(newData);
            }
          }
        })
      },800)
    })

    //坐标转换之后的回调函数
    function translateCallback(data){
      if(data.status !== 0) {
        console.log('地图坐标转换出错');
        return;
      }

      // 创建标注
      marker = new BMap.Marker(data.points[0], {icon: myIcon});
      bm.addOverlay(marker);

      //设置中心点
      bm.setCenter(data.points[0]);

      // 创建定位控件_返回用户位置
      let userPoint = new BMap.Point(data.points[0].lng, data.points[0].lat);
      myPanToUserLocation = new panToUserLocation(userPoint, defaultZoom);
      bm.addControl(myPanToUserLocation);
    }

    //绘制覆盖物
    function creatMarker(data){
      for (let i = 0; i < data.length; i++) {
        let lng = data[i].longitude,
            lat = data[i].latitude,
            id = data[i].locationId,
            text = data[i].courseCount;

        let myCompOverlay = new ComplexCustomOverlay(new BMap.Point(lng, lat), text, id, i, {
          click: () => {
            let courseParam = props.courseParam,
                currentPixelPoint = bm.pointToPixel(myCompOverlay._point), //将当前对象的经纬度转化为坐标
                currentX = currentPixelPoint.x, //点击对象横向坐标
                currentY = currentPixelPoint.y, //点击对象纵向坐标
                mapSize = bm.getSize(), //获取地图的尺寸
                popupH, //获取弹层的高度
                moveX = (mapSize.width / 2 + 28) - currentX,
                moveY; //显示弹层后需要纵向位移的距离

            that.props.initializeData();

            setTimeout(()=>{
              popupH = $('.classPopup').height();
              moveY = currentY < (mapSize.height - popupH) ? 0 : (mapSize.height - popupH) - currentY + 20;

              bm.panBy(moveX,moveY);
            },100)

            if (courseParam) {
              courseParam.param.index = 0;
              courseParam.param.locationId = myCompOverlay._id
              that.props.resultHandle(courseParam);
            }

            $('.spaceCourses').each(function(i,item){
              let courseId = Number($(this).attr('id'));

              if($(this).hasClass('current')){
                $(this).removeClass('current');
              }

              $(this).css({
                'background-image':'url(/images/spaces/spaces_map_icon_bubble.svg)'
              });

              if(courseId == myCompOverlay._id){
                $(this).addClass('current').css({
                  'background-image':'url(/images/spaces/spaces_map_icon_bubble_lucency.svg)'
                });

                myCompOverlay._text = $(this).find('span').text();
              }
            })

            that.setState({
              spaceId: myCompOverlay._id,
              courseCount: myCompOverlay._text
            })

            that.showCoursePopup();
          }
        });

        bm.addOverlay(myCompOverlay);
      }
    }
  }

  nextStep() {
    localStorage.setItem('mapPopup', 'ok');

    this.setState({
      mapReminder_1: false,
      mapReminder_2: true
    })
  }

  closeDefaultPopup() {
    this.setState({
      defaultPopup: false,
      mapReminder_1: true,
      mapReminder_2: false
    })
  }

  showCoursePopup() {
    this.setState({coursePopup: true})
  }

  closeCoursePopup() {
    this.changeBgImg();
    this.setState({coursePopup: false})
  }

  changeBgImg(){
    $('.spaceCourses').each(function(i,item){
      let bgImg = $(this).css('background-image');

      if(bgImg.indexOf('spaces_map_icon_bubble_lucency') > 0){
        $(this).css('background-image',bgImg.replace(/spaces_map_icon_bubble_lucency/ig,'spaces_map_icon_bubble'))
      }
    })
  }

  //租用空间点击事件
  rentSpace(locId){
    window._tracking('Space', locId, "RentSpace");
    Login.checkLogin((loginInfo) => {
      this.checkWhetherTeacher();
    }, '/index.html?rentSpace=1');
  }

  checkWhetherTeacher() {
    let loadLoginInfo = Login.loadLoginInfo() || {},
      userRoles = loadLoginInfo.accountTypes || [];
    if (userRoles.indexOf('TEACHER') == -1) {
      redirect("is-teacher.html");
      return;
    }
    redirect("teacher-profile.html");//跳转到老师页面
  }

  userApplyCourse(locId) {
    window._tracking('Space', locId, 'CseDemands');
    let url = "/spa-apply-course.html?locId=" + locId;
    history.push(url);
  }

  toLocDetail(loc) {
    let props = this.props,
        location = this.props.currentLocation,
        locId = loc.locationId || '',
        lng = location.lng || '',
        lat = location.lat || '',
        url = "/spa-loc-details.html?locId=" + locId + "&lng=" + lng + "&lat=" + lat + '&from=map';

    window._tracking('Space', locId, 'Location_LocationDetail');
    history.push(url);
  }

  render() {

    let spaceItem = getLocationData.map((item, i) => {
      if (item.locationId == this.state.spaceId) {
        return (
          <div className="title" key={i} onClick={this.toLocDetail.bind(this, item)}>
            <a href="javascript:;">
              <h3>
                <span>{item.locationName}</span>
                <i className="iconfont icon-youjiantou"/>
              </h3>
            </a>
            <dl>
              <dt>{item.address}</dt>
              <dd>
                {
                  item.distance
                    ? item.distance < 1000
                    ? Math.round(item.distance) + "m"
                    : item.distance > 10000
                      ? ">10km"
                      : (Math.round(item.distance / 100) / 10).toFixed(1) + "km"
                    : null
                }
              </dd>
            </dl>
          </div>
        )
      }
    })

    let locId = this.state.spaceId;

    return (
      <div className="spaces-map">

        {/*Loading*/}
        <div className="popupLoading"><Loading/></div>

        {/*地图*/}
        <div className="map-content">
          {/*切换显示模式*/}
          <Link to="/location-list.html"
             className="spaces-icon switchList hide">
            <img src="images/spaces/spaces_map_icon_list.svg"/>
          </Link>

          {/*移动的浮标*/}
          <a href="javascript:;" className="centerAnchor hide">
            <img src="images/spaces/spaces_map_icon_aim.svg"/>
          </a>

          {/*嵌入地图*/}
          <div className="map" ref="map"></div>
        </div>

        {/*时间控件*/}
        <div className="dateSlider hide">
          <dl>
            <dt>
              <ul>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li>&nbsp;</li>
                <li className="all">&nbsp;</li>
              </ul>
              <span className="date showTime">
                <em>{moment(new Date()).add(6, 'day').format('ddd')}</em>
                <i>{moment(new Date()).add(6, 'day').format('MM/DD')}</i>
                <small/>
              </span>
              <img className="iconBall" src="images/spaces/spaces_map_icon_ball.svg" alt=""/>
              <span className="changeBg"/>
              <span className="line"/>
            </dt>
            <dd>
              <span className="date">
                <em>{__('今天')}</em>
                <i>{moment(new Date()).format('MM/DD')}</i>
              </span>
            </dd>
          </dl>
        </div>

        {/*默认弹窗*/}
        <div className={
          this.state.defaultPopup
            ? "defaultPopup"
            : "defaultPopup hide"
        }>
          {/*提示1*/}
          <div className={
            this.state.mapReminder_1
              ? "mapReminder_1"
              : "mapReminder_1 hide"
            }>
            <div className="container">
              <img src="images/spaces/popup-map.png" alt=""/>
              <ul>
                <li>
                  <span className="left"><i className="round"></i></span>
                  <span className="right">
                    {
                      urlLang == 'zh-CN'
                        ? '每个气泡代表一个空间'
                        : 'Each bubble represents a space'
                    }
                  </span>
                </li>
                <li>
                  <span className="left"><i className="round"></i></span>
                  <span className="right">
                    {
                      urlLang == 'zh-CN'
                        ? '数字代表该空间的开课数量'
                        : 'The number represents the number of classes in the space'
                    }
                  </span>
                </li>
              </ul>
            </div>
            <a className="close" href="javascript:;" onClick={this.nextStep.bind(this)}>
                <img src="images/spaces/icon_ok.svg" alt=""/>
                <span>{__('知道啦')}</span>
            </a>
          </div>
          {/*提示2*/}
          <div className={
            this.state.mapReminder_2
              ? "mapReminder_2"
              : "mapReminder_2 hide"
            }>
              <div className="container">
                <dl>
                  <dt>{__('上下滑动可调整筛选的时间范围')}</dt>
                  <dd>
                      <img className="guide" src="images/spaces/icon_guide.svg" alt=""/>
                    {
                      urlLang == 'zh-CN'
                        ? <img className="timerShaft" src="images/spaces/timerShaft-CN.svg" alt=""/>
                        : <img className="timerShaft" src="images/spaces/timerShaft-EN.svg" alt=""/>
                    }
                  </dd>
                </dl>
              </div>
              <a className="close" href="javascript:;" onClick={this.closeDefaultPopup.bind(this)}>
                  <img src="images/spaces/icon_ok.svg" alt=""/>
                  <span>{__('知道啦')}</span>
              </a>
          </div>
        </div>

        {/*课程弹窗*/}
        <div className={
          this.state.coursePopup
            ? "classPopup"
            : "classPopup hide"
        }>

          <div className="closeClassPopup">
            <i className="iconfont icon-close1"
              onClick={this.closeCoursePopup.bind(this)} />
          </div>

          {spaceItem}

          {
            this.state.courseCount == 0
              ? <div className="classesContent">
                <h5>{__('该空间暂无开课情况')}</h5>
                <p>{__('如果您想在该空间上课，可点击“申请课程”告诉我们')}</p>
                <a className="feedBack"
                  onClick={this.userApplyCourse.bind(this, locId)}
                  href="javascript:;">
                  {__('申请课程')}
                </a>
              </div>
              : <div className="classesContent">
                <h6>{this.state.courseCount + ' ' +  __('节课')}</h6>
                <LocationCourseList
                  spaceId={locId}
                  locationId={locId}
                  from="map"
                  {...this.props} />
              </div>
          }

          <a href="javascript:;" onClick={this.rentSpace.bind(this,locId)} className="rentSpace">
            {__('租用空间')}
          </a>

          <span className="btn-iphoneX"/>
        </div>
      </div>
    )
  }
}
