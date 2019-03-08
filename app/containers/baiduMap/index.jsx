import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import {getSpaces, getLocationsByDistance, getCourseBySpace, userLocation} from '../../actions/student'
import {__} from '../../static/js/i18n';
import Nav from '../../component/nav/student/';
import getUrl from '../../utils/getUrl';
import getLocation from '../../utils/getLocation';
import wxUtils from '../../utils/wechat'
import SpacesMap from './page-map/';

class Spaces extends Component {

  constructor(props) {
    super(props);

    this.spacesListByDistance = {
      "param": {
        "longitude": "",
        "latitude": "",
        "keyWord": "",
        "endDate": moment(new Date()).add(6, 'day').format('YYYY-MM-DD'),
        "distance": null,
        "max": 10
      }
    }

    this.courseParam = {
      "param": {
        "locationId": null,
        "spaceId": null,
        "keyWord": "",
        "endDate": moment(new Date()).add(6, 'day').format('YYYY-MM-DD'),
        "index": 0,
        "size": 10
      }
    }
  }

  componentWillMount() {
    let state = this.state,
        spacesListByDistance = this.spacesListByDistance,
        userLocation = this.props.currentLocation;

    getLocation().then((item) => {
      spacesListByDistance.param.longitude = item.longitude;
      spacesListByDistance.param.latitude = item.latitude;

      this.getLocations();

      userLocation.lng = item.longitude;
      userLocation.lat = item.latitude;
      this.props.userLocation();
    }).catch(error => {
      let lng = 121.4602700000,
          lat = 31.2287800000;

      spacesListByDistance.param.longitude = lng;
      spacesListByDistance.param.latitude = lat;

      this.getLocations();

      userLocation.lng = lng;
      userLocation.lat = lat;
      this.props.userLocation();
    });
  }

  componentDidMount(){
    if(window.urlParams.weixin){
      wxUtils.getShare();
    }
  }

  getLocations(){
    let that = this,
        spacesListByDistance = that.spacesListByDistance;

    that.props.getLocationsByDistance(spacesListByDistance).then((item)=>{
      let data = item.payload.data;
      if(data.error == null){
        that.refs.spaces.getLocation(data.result)
      }
    })
  }

  //分页
  loadMoreData(jsonParam) {
    const page = jsonParam.param.index;

    this.setState({
      isLoading: true
    })

    jsonParam.param.index = page + 1;

    if (this.state.hasMore) {
      this.resultHandle(jsonParam);
    }

    this.setState({
      isLoading: false
    })
  }

  resultHandle(jsonParam) {
    this.props.getCourseBySpace(jsonParam).then((item) => {
      const data = item.payload.data.result;

      let courseLsit = this.state.data.concat(data);

      this.setState({
        data: courseLsit,
        hasMore: data.length >= jsonParam.param.size  //返回的数据小于每页显示的条数则不显示loading
      })
    })
  }

  //初始化数据
  initializeData() {
    this.setState({data: []})
  }

  render() {
    return (
      <div className="page-spaces page-white">
        <div className="spaces-content">

          {/*地图*/}
          <SpacesMap
            ref="spaces"
            spacesListParam={this.spacesListByDistance}
            courseParam={this.courseParam}
            resultHandle={this.resultHandle.bind(this)}
            loadMoreData={this.loadMoreData.bind(this)}
            initializeData={this.initializeData.bind(this)}
            {...this.state}
            {...this.props}
          />

          {/*页底导航*/}
          <Nav Index="3"/>

        </div>
      </div>
    )
  }
}

// -------------------redux react 绑定--------------------

function mapStateToProps(store) {
  return {
    spacesList: store.studentPosts.spacesList,
    courseListBySpaces: store.studentPosts.courseListBySpaces,
    currentLocation: store.studentPosts.currentLocation
  }
}

export default connect(mapStateToProps, {
  getSpaces,
  getLocationsByDistance,
  getCourseBySpace,
  userLocation
})(Spaces);
