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
