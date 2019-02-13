import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'
import asyncComponent from '../components/asyncComponent/index'
import ScrollTop from '../components/scrollTop'

const Home = asyncComponent(() => import('../containers/home'));
const SnowFlake = asyncComponent(() => import('../containers/snowflake'));
const NotFound = asyncComponent(() => import('../containers/404'));

export default class extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ScrollTop>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path='/snowflake' component={SnowFlake} />
            <Route path="/404.html" component={NotFound} />
            <Redirect to="/404.html" />
          </Switch>
        </ScrollTop>
      </BrowserRouter>
    )
  }
}
