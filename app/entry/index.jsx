import { Provider } from "mobx-react"
import store from '../store/'
import App from '../router'

import '../static/less/reset.less'
import '../static/less/base.less'

ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('wrapper')
);

if (module.hot) {
  module.hot.accept()
}