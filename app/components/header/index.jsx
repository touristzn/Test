import { NavLink } from 'react-router-dom'
import './style.less'

export default class extends React.Component {
  render() {
    return (
      <header>
        <h1>这是头部s</h1>
        <nav>
          <ul>
            <li><NavLink exact to="/">home</NavLink></li>
            <li><NavLink to="/snowflake">snowflake</NavLink></li>
          </ul>
        </nav>
      </header>
    )
  }
}
