import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { get, compose } from 'lodash/fp'
import { push } from 'connected-react-router'
import { HOLOCHAIN_POLL_INTERVAL_SLOW } from 'util/holochain'
import { threadUrl } from 'util/navigation'
import getMe from 'store/selectors/getMe'
import HolochainMessageThreadsQuery from 'graphql/queries/HolochainMessageThreadsQuery.graphql'

export function mapStateToProps (state, props) {
  return {
    currentUser: getMe(state, props)
  }
}

export function mapDispatchToProps (dispatch, props) {
  return {
    goToThread: id => dispatch(push(threadUrl(id)))
  }
}

const threads = graphql(HolochainMessageThreadsQuery, {
  variables: {
    firstMessages: 80,
    first: 20,
    offset: null
  },
  props: ({ data: { messageThreads, loading } }) => {
    const threads = loading ? [] : get('items', messageThreads)

    return {
      threads: threads,
      pending: loading
    }
  },
  options: {
    pollInterval: HOLOCHAIN_POLL_INTERVAL_SLOW
  }
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  threads
)
