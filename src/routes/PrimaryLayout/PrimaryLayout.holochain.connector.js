import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'
import { push } from 'connected-react-router'
import { get } from 'lodash/fp'
import { communityUrl } from 'util/navigation'
import mobileRedirect from 'util/mobileRedirect'
import { HOLOCHAIN_POLL_INTERVAL_SLOW } from 'util/holochain'
import HolochainCommunityQuery from 'graphql/queries/HolochainCommunityQuery.graphql'
import HolochainCurrentUserQuery from 'graphql/queries/HolochainCurrentUserQuery.graphql'
import fetchForCurrentUserMock from 'store/actions/fetchForCurrentUserMock'
import isCommunityRoute, { getSlugFromLocation } from 'store/selectors/isCommunityRoute'
import getMe from 'store/selectors/getMe'
import { getReturnToURL } from 'router/AuthRoute/AuthRoute.store'
import { toggleDrawer } from './PrimaryLayout.store'

export function mapStateToProps (state, props) {
  const slug = getSlugFromLocation(null, props)

  return {
    currentUser: getMe(state),
    slug,
    returnToURL: getReturnToURL(state),
    isCommunityRoute: isCommunityRoute(state, props),
    downloadAppUrl: mobileRedirect(),
    isDrawerOpen: get('PrimaryLayout.isDrawerOpen', state),
    showLogoBadge: false,
    // not used by holochain
    fetchForCommunity: () => {},
    fetchForCurrentUser: () => {}
  }
}

export function mapDispatchToProps (dispatch, props) {
  const slug = getSlugFromLocation(null, props)

  return bindActionCreators({
    fetchForCurrentUserMock,
    toggleDrawer,
    goBack: () => push(communityUrl(slug))
  }, dispatch)
}

const community = graphql(HolochainCommunityQuery, {
  skip: props => !props.currentUser || !props.slug,
  props: ({ data: { community, loading } }) => ({
    community: community || {},
    communityPending: loading
  }),
  variables: props => ({
    slug: props.slug
  }),
  options: {
    pollInterval: HOLOCHAIN_POLL_INTERVAL_SLOW
  }
})

const currentUserFromHolochainAgent = graphql(HolochainCurrentUserQuery, {
  skip: props => props.currentUser,
  props: ({ data: { me: holochainAgent, loading }, ownProps: { fetchForCurrentUserMock } }) => {
    if (loading) return
    // * Merges Holochain Agent data into the Redux ORM CurrentUser mock
    fetchForCurrentUserMock(holochainAgent)
    return {
      holochainAgent
    }
  }
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  currentUserFromHolochainAgent,
  community
)
