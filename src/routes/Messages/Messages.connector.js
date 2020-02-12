import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { get, isEmpty } from 'lodash/fp'
import { push } from 'connected-react-router'
import { threadUrl } from 'util/navigation'
import changeQuerystringParam from 'store/actions/changeQuerystringParam'
import isPendingFor from 'store/selectors/isPendingFor'
import fetchThreads from 'store/actions/fetchThreads'
import fetchPeople from 'store/actions/fetchPeople'
import fetchRecentContacts from 'store/actions/fetchRecentContacts'
import getPreviousLocation from 'store/selectors/getPreviousLocation'
import getMe from 'store/selectors/getMe'
import {
  createMessage,
  fetchMessages,
  fetchThread,
  findOrCreateThread,
  updateMessageText,
  updateThreadReadTime,
  setThreadSearch,
  setContactsSearch,
  getAllContacts,
  getMatchingContacts,
  getParticipantsFromQuerystring,
  getTextForCurrentMessageThread,
  getThreadSearch,
  getThreads,
  getThreadsHasMore,
  getMessages,
  getMessagesHasMore,
  getCurrentMessageThread,
  getRecentContacts
} from './Messages.store'

export function mapStateToProps (state, props) {
  const routeParams = get('match.params', props)
  const messageThreadId = get('messageThreadId', routeParams)

  return {
    messageThreadId,
    contacts: getAllContacts(state, props),
    recentContacts: getRecentContacts(state),
    matchingContacts: getMatchingContacts(state, props),
    participants: getParticipantsFromQuerystring(state, props),
    onCloseURL: getPreviousLocation(state),
    currentUser: getMe(state),
    messageThreadPending: isPendingFor(fetchThread, state),
    messageThread: getCurrentMessageThread(state, props),
    messageText: getTextForCurrentMessageThread(state, props),
    messagesPending: isPendingFor(fetchMessages, state),
    threadsPending:
      isPendingFor(fetchThreads, state) ||
      isPendingFor(fetchMessages, state),
    threads: getThreads(state, props),
    hasMoreThreads: getThreadsHasMore(state, props),
    threadSearch: getThreadSearch(state, props),
    sendIsTyping: () => {},
    messages: getMessages(state, props),
    hasMoreMessages: getMessagesHasMore(state, { id: messageThreadId }),
    messageCreatePending:
      isPendingFor(createMessage, state) ||
      isPendingFor(findOrCreateThread, state)
  }
}

export function mapDispatchToProps (dispatch, props) {
  return bindActionCreators({
    setContactsSearch,
    setThreadSearch,
    updateMessageText,
    fetchThreads,
    fetchMessages,
    findOrCreateThread,
    createMessage,
    changeQuerystringParam,
    fetchRecentContacts,
    fetchPeople,
    updateThreadReadTime,
    fetchThread,
    goToThread: messageThreadId => push(threadUrl(messageThreadId))
  }, dispatch)
}

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const { threads, messages, hasMoreThreads, messageThreadId } = stateProps
  const fetchThread = () => dispatchProps.fetchThread(messageThreadId)
  const fetchThreads = () => dispatchProps.fetchThreads(20, 0)
  const fetchMoreThreads =
    hasMoreThreads
      ? () => dispatchProps.fetchThreads(20, threads.length)
      : () => {}
  const fetchMessagesCursor = !isEmpty(messages) && messages[0].id
  const fetchMessages = () => dispatchProps.fetchMessages(messageThreadId, {
    cursor: fetchMessagesCursor
  })

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    fetchThread,
    fetchThreads,
    fetchMoreThreads,
    fetchMessages
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)
