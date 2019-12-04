import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get, isEmpty, some, find, orderBy } from 'lodash/fp'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { toRefArray, itemsToArray } from 'util/reduxOrmMigration'
import { humanDate, textLength, truncate } from 'hylo-utils/text'
import { newMessageUrl, threadUrl, messagesUrl } from 'util/navigation'
import RoundImageRow from 'components/RoundImageRow'
import TopNavDropdown from '../TopNavDropdown'
import { participantAttributes, isUnread, isUpdatedSince } from 'store/models/MessageThread'
import NoItems from 'routes/PrimaryLayout/components/TopNav/NoItems'
import LoadingItems from 'routes/PrimaryLayout/components/TopNav/LoadingItems'
import './MessagesDropdown.scss'

export default class MessagesDropdown extends Component {
  static defaultProps = {
    openLastThread: true
  }

  constructor (props) {
    super(props)
    this.dropdown = React.createRef()
    this.state = {}
  }

  componentDidMount = () => {
    const { fetchThreads } = this.props
    if (fetchThreads) fetchThreads()
  }

  onToggle = nowActive => {
    // * this is not quite sufficient -- this value should also be bumped
    //   if the current user is in the messages UI, receiving new messages
    if (nowActive) this.setState({ lastOpenedAt: new Date() })
  }

  hasUnread () {
    if (isEmpty(this.props.threads)) {
      const { currentUser } = this.props
      return currentUser && currentUser.unseenThreadCount > 0
    }

    const { lastOpenedAt } = this.state

    return some(
      thread => isUnread(thread) && (!lastOpenedAt || isUpdatedSince(thread, lastOpenedAt)),
      this.props.threads
    )
  }

  render () {
    const {
      renderToggleChildren,
      threads,
      className,
      openLastThread,
      goToThread,
      currentUser,
      pending
    } = this.props

    const onClick = id => {
      if (id) goToThread(id)
      this.dropdown.current.toggle(false)
    }

    let body
    if (pending) {
      body = <LoadingItems />
    } else if (isEmpty(threads)) {
      body = <NoItems message="You don't have any conversations yet" />
    } else {
      body = <div styleName='threads'>
        {threads.map(thread =>
          <MessagesDropdownItem
            thread={thread}
            onClick={() => onClick(thread.id)}
            currentUser={currentUser}
            key={thread.id}
          />
        )}
      </div>
    }

    const firstThreadUrl = !isEmpty(threads)
      ? threadUrl(threads[0].id)
      : newMessageUrl()

    const openMessagesUrl = openLastThread
      ? firstThreadUrl
      : messagesUrl()

    return <TopNavDropdown
      ref={this.dropdown}
      className={className}
      onToggle={this.onToggle}
      toggleChildren={renderToggleChildren(this.hasUnread())}
      header={
        <div styleName='header-content'>
          <Link to={openMessagesUrl} styleName='open'>
            Open Messages
          </Link>
          <Link to={newMessageUrl()} styleName='new'>New</Link>
        </div>}
      body={body}
    />
  }
}

MessagesDropdown.propTypes = {
  className: PropTypes.any,
  currentUser: PropTypes.object,
  fetchThreads: PropTypes.func,
  goToThread: PropTypes.func,
  pending: PropTypes.any,
  renderToggleChildren: PropTypes.func,
  threads: PropTypes.array
}

export function MessagesDropdownItem ({ thread, onClick, currentUser, maxMessageLength = 145 }) {
  if (!thread) return null

  const messages = toRefArray(itemsToArray(thread.messages))
  const message = orderBy(m => Date.parse(m.createdAt), 'desc', messages)[0]

  if (!message || !message.text) return null

  const participants = toRefArray(thread.participants)
  const { names, avatarUrls } = participantAttributes(thread, currentUser, 2)

  var displayText = lastMessageCreator(message, currentUser, participants) + message.text

  if (textLength(displayText) > maxMessageLength) {
    displayText = `${truncate(displayText, maxMessageLength)}...`
  }

  return <li styleName={cx('thread', { unread: isUnread(thread) })}
    onClick={onClick}>
    <div styleName='image-wrapper'>
      <RoundImageRow imageUrls={avatarUrls} vertical ascending cap='2' />
    </div>
    <div styleName='message-content'>
      <div styleName='name'>{names}</div>
      <div styleName='body'>{displayText}</div>
      <div styleName='date'>{humanDate(thread.updatedAt)}</div>
    </div>
  </li>
}

MessagesDropdownItem.propTypes = {
  currentUser: PropTypes.any,
  onClick: PropTypes.any,
  thread: PropTypes.any,
  maxMessageLength: PropTypes.number
}

export function lastMessageCreator (message, currentUser, participants) {
  const creatorPersonId = get('creator.id', message) || get('creator', message)

  if (creatorPersonId === currentUser.id) return 'You: '
  if (participants.length <= 2) return ''
  return find(p => p.id === creatorPersonId, participants).name + ': '
}
