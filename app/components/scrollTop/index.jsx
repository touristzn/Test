import { withRouter } from 'react-router-dom'

@withRouter
export default class extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }
  
  render() {
    return this.props.children
  }
}
