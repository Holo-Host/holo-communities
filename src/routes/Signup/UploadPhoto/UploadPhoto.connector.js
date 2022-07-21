import { connect } from 'react-redux'
import getMe from 'store/selectors/getMe'
import { push, goBack } from 'connected-react-router'
import updateUserSettings from 'store/actions/updateUserSettings'

export function mapStateToProps (state, props) {
  return {
    currentUser: getMe(state),
    uploadImagePending
  }
}

export function mapDispatchToProps (dispatch, props) {
  return {
    updateUserSettings: (changes) => dispatch(updateUserSettings(changes)),
    goToNextStep: () => dispatch(push('/signup/add-location')),
    goBack: () => dispatch(goBack())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)
