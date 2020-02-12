import { connect } from 'react-redux'
import getMe from 'store/selectors/getMe'

export function mapStateToProps (state, props) {
  return {
    currentUser: getMe(state),
    sendIsTyping: () => {}
  }
}

export default connect(mapStateToProps)
