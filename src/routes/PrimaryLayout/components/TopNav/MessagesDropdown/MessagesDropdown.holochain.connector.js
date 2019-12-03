import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { get, compose } from 'lodash/fp'
import { push } from 'connected-react-router'
import { threadUrl } from 'util/navigation'
import getMe from 'store/selectors/getMe'
import MessageThreadsQuery from 'graphql/queries/MessageThreadsQuery.graphql'

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

const threads = graphql(MessageThreadsQuery, {
  variables: {
    firstMessages: 80,
    first: 20,
    offset: null
  },
  props: ({ data: { me, loading } }) => {
    const threads = loading ? [] : get('messageThreads.items', me)

    return {
      threads: threads,
      pending: loading
    }
  }
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  threads
)
