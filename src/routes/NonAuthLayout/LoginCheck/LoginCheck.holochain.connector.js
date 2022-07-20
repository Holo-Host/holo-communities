import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { isNull, compose } from 'lodash/fp'
import { setLogin } from '../Login/Login.store'
import HolochainCurrentUserQuery from 'graphql/queries/HolochainCurrentUserQuery.graphql'

export function mapStateToProps (state, props) {
  return {
    hasCheckedLogin: !isNull(state.login.isLoggedIn)
  }
}

const mapDispatchToProps = {
  setLogin
}

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const { holochainAgent } = ownProps
  const { setLogin } = dispatchProps

  const checkLogin = holochainAgent
    // is logged-in/registered if name for agent exists
    ? () => setLogin(holochainAgent.name)
    : () => {}

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    checkLogin
  }
}

const holochainAgent = graphql(HolochainCurrentUserQuery, {
  skip: props => props.holochainAgent,
  props: ({ data: { me: holochainAgent } }) => ({
    holochainAgent
  }),
  options: {
    fetchPolicy: 'no-cache'
  }
})

export default compose(
  holochainAgent,
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)
