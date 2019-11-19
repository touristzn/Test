import { observer, inject } from 'mobx-react'
import pureRender from "pure-render-decorator"

import Header from '../../components/header'
import Footer from '../../components/footer'
import Loading from '../../components/loading'
import { fetch } from '../../request/agent'

/*此处的名字home对应store文件夹下index.js中创建实例时定义的名字*/
@inject('home')
@pureRender  // 避免组件重复渲染
@observer
export default class extends React.Component {
  list() {
    const param = {
      platform: 'h5',
      uin: 0,
      needNewCode: 1
    }
    
    fetch(param).then(res => {
      if (res) console.log(res)
    })
  }

  render() {
    return (
      <article>
        <Header />
        <section className="main page-home">
          <div className="banners">
            {
              this.props.home.loading ? <Loading /> : null
            }
            <ul>
              {
                this.props.home.banners.map((val,i) => {
                  return (
                    <li key={i}><img src={val.picUrl} /></li>
                  )
                })
              }
            </ul>
          </div>
        </section>
        <Footer />
        <p onClick={this.list.bind(this)}>aaaaa</p>
      </article>
    )
  }
}
