import moment from 'moment'
import { urlLang } from '../lang/lang'
import {__} from '../static/js/i18n'

export let dateSlider = {
  containers:'',
  sliderDom:'',
  index: 6,
  len: 0,
  moveIndex: 1,
  sHeight: 16,
  startScroll: 0,
  nowScroll: 0,
  endScroll: 0,
  spacesParam:'',
  getLocations:null,
  courseParam:'',
  getLocationData:[],
  init:function(spacesParam,getLocations,courseParam,data){
    this.containers = $('.dateSlider');
    this.sliderDom = this.containers.find('.iconBall');
    this.len = this.containers.find('li').length;
    this.spacesParam = spacesParam;
    this.getLocations = getLocations;
    this.courseParam = courseParam;
    this.getLocationData = data;
    this.sliderDom.on('touchstart',this.startMove.bind(this));
    this.sliderDom.on('touchmove',this.nowMove.bind(this));
    this.sliderDom.on('touchend',this.endMove.bind(this));
    this.containers.find('ul').on('touchstart',this.startMove.bind(this));
    this.containers.find('ul').on('touchmove',this.nowMove.bind(this));
    this.containers.find('ul').on('touchend',this.endMove.bind(this));
  },
  startMove:function(e){
    this.startScroll = e.originalEvent.changedTouches[0].pageY;
    e.preventDefault();
  },
  nowMove:function(e){
    let weekday,
        index = 1,
        containers = this.containers,
        len = this.len;

    this.nowScroll= e.originalEvent.changedTouches[0].pageY - this.startScroll;

    if(this.nowScroll < 0 && this.nowScroll > -100){
      index = Math.min(len-1, this.index + Math.round(Math.abs(this.nowScroll)/16))

      let height = index * this.sHeight;
      if(index == len - 1){
        this.sliderDom.css({
          transform:'translate(-50%,-' + (height + 18) + 'px)'
        })
        containers.find('.showTime').css({
          transform:'translateY(-' + (height + 18) + 'px)'
        })
        containers.find('.changeBg').height(height)
      }else{
        this.sliderDom.css({
          transform:'translate(-50%,-' + (height + (Math.abs(this.nowScroll) - height) + 34) + 'px)'
        })
        containers.find('.showTime').css({
          transform:'translateY(-' + (height + (Math.abs(this.nowScroll) - height) + 44) + 'px)'
        })
        containers.find('.changeBg').height(height + (Math.abs(this.nowScroll) - height) + 16)
      }
      showText(index);
    }

    if(this.nowScroll > 0){
      index = Math.max(1, this.index - Math.round(this.nowScroll/16));

      if(index == 1){
        this.sliderDom.css({
          transform:'translate(-50%,-' + (index * this.sHeight + 18) + 'px)'
        })
        containers.find('.showTime').css({
          transform:'translateY(-' + (index * this.sHeight + 28) + 'px)'
        })
        containers.find('.changeBg').height(index * this.sHeight)
      }else{
        this.sliderDom.css({
          transform:'translate(-50%,-' + (this.index * this.sHeight + 18 - this.nowScroll) + 'px)'
        })
        containers.find('.showTime').css({
          transform:'translateY(-' + (this.index * this.sHeight + 18 - this.nowScroll) + 'px)'
        })
        containers.find('.changeBg').height(this.index * this.sHeight + 16 - this.nowScroll)
      }

      showText(index);
    }

    function showText(index){
      let dateTxt = moment(new Date()).add(index, 'day')

      if(index == 1){
        weekday = __('明天');
      }else if(index == 2){
        if(urlLang == "zh-CN"){
          weekday = "后天";
        }else{
          weekday = dateTxt.format('ddd')
        }
      } else if(index == len -1){
        weekday = __('全部');
      }else{
        if(urlLang == "zh-CN"){
          weekday = '周'+ dateTxt.format('dd')
        }else{
          weekday = dateTxt.format('ddd')
        }
      }

      containers.find('.showTime em').text(weekday);
      if(index == len - 1){
        containers.find('.showTime i').hide().text('');
      }else{
        containers.find('.showTime i').show().text(dateTxt.format('MM/DD'));
      }
    }

    e.preventDefault();
  },
  endMove:function(e){
    this.endScroll= e.originalEvent.changedTouches[0].pageY - this.startScroll;

    if(this.endScroll < 0){
      this.up();
    }
    if(this.endScroll > 0){
      this.down();
    }
    e.preventDefault();
  },
  up:function(){
    this.index = Math.min(this.len - 1, this.index + Math.round(Math.abs(this.endScroll)/16))
    this.scroll(this.index);
  },
  down:function(e){
    this.index = Math.max(1, this.index - Math.round(this.endScroll/16))
    this.scroll(this.index);
  },
  scroll:function(index){
    let sHeight = this.sHeight,
        len = this.len,
        top = -(index * sHeight + 26 - 8);  //26是中间滑块高度、8是反向移动的距离

    this.sliderDom.css({
      transform:'translate(-50%,' + top + 'px)'
    })
    this.containers.find('.changeBg').height(index * sHeight);

    if(index == len-1){
      this.containers.find('.showTime').css({
        transform:'translateY(-' + (index * sHeight + 18) + 'px)'
      })
    }else{
      this.containers.find('.showTime').css({
        transform:'translateY(-' + (index * sHeight + 28) + 'px)'
      })
    }

    //显示时间文字
    let dateTxt = moment(new Date()).add(index, 'day');

    let spacesParam = this.spacesParam,
        courseParam = this.courseParam,
        currentDate = moment(dateTxt).format('YYYY-MM-DD');

    if(spacesParam.param.endDate != currentDate){
      if(index == len - 1){
        spacesParam.param.endDate = null;
        courseParam.param.endDate = null;
      }else{
        spacesParam.param.endDate = currentDate;
        courseParam.param.endDate = currentDate;
      }
      let slider_date = spacesParam.param.endDate;

      window._tracking('Space','Map_Click', slider_date);

      this.getLocations(spacesParam).then((item)=>{
        let data = item.payload.data;

        if(data.error == null){
          this.getLocationData = data.result;

          $('.spaceCourses').each(function(i,item){
            let courseId = Number($(this).attr('id'));

            for(let j=0; j < data.result.length; j++){
              if(data.result[j].locationId == courseId){
                let courseCount = data.result[j].courseCount;
                $(this).find('span').text(courseCount)
              }
            }
          })
        }
      });
    }
  }
}
