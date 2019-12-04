import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { get, compose } from 'lodash/fp'
import { graphql } from 'react-apollo'
import { sendIsTyping } from 'client/websockets'
import { push } from 'connected-react-router'
import {
  currentDateString,
  HOLOCHAIN_POLL_INTERVAL_SLOW,
  HOLOCHAIN_POLL_INTERVAL_FAST
} from 'util/holochain'
import { threadUrl, communityUrl } from 'util/navigation'
import changeQuerystringParam from 'store/actions/changeQuerystringParam'
import getMe from 'store/selectors/getMe'
// import getPreviousLocation from 'store/selectors/getPreviousLocation'
import { NEW_THREAD_ID } from './Messages'
import HolochainPeopleQuery from 'graphql/queries/HolochainPeopleQuery.graphql'
import FindOrCreateThreadMutation from 'graphql/mutations/FindOrCreateThreadMutation.graphql'
import CreateMessageMutation from 'graphql/mutations/CreateMessageMutation.graphql'
import HolochainMessageThreadsQuery from 'graphql/queries/HolochainMessageThreadsQuery.graphql'
import MessageThreadQuery from 'graphql/queries/MessageThreadQuery.graphql'
import {
  updateMessageText,
  setThreadSearch,
  setContactsSearch,
  getTextForCurrentMessageThread,
  getThreadSearch,
  getContactsSearch,
  filterThreadsByParticipant,
  sortByName
} from './Messages.store'

const mockSocket = { on: () => {}, off: () => {} }

// Redux for local store, react-router/window location and socket stuff only

export function mapStateToProps (state, props) {
  const routeParams = get('match.params', props)
  const messageThreadId = get('messageThreadId', routeParams)

  return {
    messageThreadId,
    currentUser: getMe(state, props),
    // * For now doing the most simplest thing
    onCloseURL: communityUrl('hylo-holochain'),
    messageText: getTextForCurrentMessageThread(state, props),
    sendIsTyping: sendIsTyping(messageThreadId),
    threadSearch: getThreadSearch(state, props),
    contactsSearch: getContactsSearch(state, props),
    // * Apollo + holochain query mocks
    // These functions in an Apollo world are either not called explicitely
    // and handled implicitely by the query bindings below or not implemented.
    // They are mocked here as this component is still expecting and calling
    // them in the case of it's redux use. This keeps us from needing to
    // pollute the component with null checks before calling each of these functions.
    socket: mockSocket,
    fetchThreads: () => {},
    fetchThread: () => {},
    fetchMessages: () => {},
    fetchPeople: () => {},
    // Not implemented
    fetchRecentContacts: () => {},
    updateThreadReadTime: () => {}
  }
}

export function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    setContactsSearch,
    setThreadSearch,
    updateMessageText,
    changeQuerystringParam,
    goToThread: messageThreadId => push(threadUrl(messageThreadId))
  }, dispatch)
}

// Apollo queries, selectors, mutations and loading status

export const findOrCreateThread = graphql(FindOrCreateThreadMutation, {
  props: ({ mutate }) => ({
    findOrCreateThread: participantIds => mutate({
      variables: {
        participantIds
        // * not currently supported by hylo-holo-dnas
        // createdAt: currentDateString()
      }
    })
  })
})

export const createMessage = graphql(CreateMessageMutation, {
  props: ({ mutate, loading }) => ({
    createMessage: (messageThreadId, text, forNewThread) => mutate({
      // TODO: Figure-out how to handle loading state for mutations
      // messageCreatePending: loading,
      variables: {
        messageThreadId,
        text,
        createdAt: currentDateString()
      },
      refetchQueries: [
        {
          query: HolochainMessageThreadsQuery,
          // * Best practice: Always pass variables that are arguments to the operation even if they are null.
          // If a query that has arguments is ran, even if those arguments are not provided
          // the query result is cache keyed with those variables in the header as null
          variables: {
            first: null,
            offset: null
          }
        }
      ]
    })
  })
})

export const contacts = graphql(HolochainPeopleQuery, {
  props: ({ data: { people }, ownProps }) => {
    const contacts = get('items', people) || []
    const { contactsSearch } = ownProps
    return {
      contacts,
      matches: contactsSearch
        ? sortByName(contacts.filter(person =>
          person.name.toLowerCase().includes(contactsSearch.toLowerCase())))
        : []
    }
  },
  options: {
    pollInterval: HOLOCHAIN_POLL_INTERVAL_FAST
  }
})

export const threads = graphql(HolochainMessageThreadsQuery, {
  props: ({ data: { messageThreads, loading }, ownProps }) => {
    const threads = get('items', messageThreads)
    return {
      // TODO: Order threads by most recent message
      threads: threads && threads
        .filter(filterThreadsByParticipant(ownProps.threadSearch))
        .reverse(),
      threadsPending: loading
    }
  },
  variables: {
    firstMessages: 80,
    first: 20,
    offset: null
  },
  options: {
    pollInterval: HOLOCHAIN_POLL_INTERVAL_SLOW
  }
})

export const thread = graphql(MessageThreadQuery, {
  skip: props => !props.messageThreadId || props.messageThreadId === NEW_THREAD_ID,
  props: ({ data: { messageThread, loading } }) => ({
    messageThread,
    messages: get('messages.items', messageThread),
    messagesPending: loading
  }),
  options: props => ({
    pollInterval: HOLOCHAIN_POLL_INTERVAL_FAST,
    variables: {
      // * Best Practice: Normalize argument names in graphql queries (to explicit ID names)?
      // It may be too much magic but if we changed the query variable
      // name to messageThreadId (which I think it should be either way)
      // then we can do away with this block as Apollo will by default look
      // for matching props on the component for missing variables.
      id: props.messageThreadId
    }
  })
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  findOrCreateThread,
  createMessage,
  threads,
  thread,
  contacts
)
