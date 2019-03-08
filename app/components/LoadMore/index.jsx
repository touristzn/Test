import Loading from '../Loading'

export default class LoadMore extends React.Component {

  componentDidMount() {
      // 上下滚动时加载更多
      const loadMoreFn = this.props.loadMoreFn;
      const wrapper = this.refs.wrapper;

      let timeoutId
      function callback() {
          const top = wrapper.getBoundingClientRect().top
          const windowHeight = window.screen.height

          if (top && top < windowHeight) {
              // 证明 wrapper 已经被滚动到暴露在页面可视范围之内了
              loadMoreFn()
          }
      }
      window.addEventListener('scroll', function () {
          if (this.props.isLoading) {
              return
          }
          if (timeoutId) {
              clearTimeout(timeoutId)
          }
          timeoutId = setTimeout(callback, 50)
      }.bind(this), false);
  }

  render() {
    return (
      <div className="loading" ref="wrapper">
        {
          this.props.isLoading
          ? <Loading />
          : null
        }
      </div>
    )
  }
}

// 页面使用方法
// export default class extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       data: [],
//       hasMore: false, // 记录当前状态下还有没有更多的数据可供加载
//       isLoadingMore: false,  // 记录当前状态下，是加载中还是加载更多
//       page: 1,
//     }
//   }

//   componentDidMount() {
//     this.loadFirstData();
//   }

//   // 获取首屏数据
//   loadFirstData() {
//     this.resultHandle();
//   }

//   //加载更多
//   loadMoreData() {
//     this.setState({
//       isLoadingMore: true
//     })

//     //获取当前页码
//     const page = this.state.page;
//     // 获取下一页数据
//     this.resultHandle();
//     this.setState({
//       page: page + 1,
//       isLoadingMore: false
//     })
//   }

//   // 获取数据
//   resultHandle() {
//     // 远程数据
//     const data = [];
//     // 获取到远程数据后添加到data中
//     this.setState({
//       data: this.state.data.concat(data),
//       hasMore: , //根据当前页码是否小于或等于后台传的页码来判断true或false
//     })
//   }

//   render() {
//     const { data, hasMore, isLoadingMore } = this.state;
//     return(
//       <div>
//         {
//           data.length
//           ? <div>1111</div>
//           : <div>加载中...</div>
//         }
//         {
//           hasMore
//           ? <LoadMore isLoading={isLoadingMore} loadMoreFn={} />
//         }
//       </div>
//     )
//   }
// }
