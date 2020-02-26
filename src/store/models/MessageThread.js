import { attr, many, Model } from 'redux-orm'
import { filter, get, isEmpty } from 'lodash/fp'
import { toRefArray } from 'util/reduxOrmMigration'

// MessageThread functions

export function participantAttributes (messageThread, currentUser, maxShown) {
  const currentUserId = get('id', currentUser)
  const participants = toRefArray(messageThread.participants)
  const filteredParticipants = filter(p => p.id !== currentUserId, participants)
  var names, avatarUrls

  if (isEmpty(filteredParticipants)) {
    avatarUrls = [get('avatarUrl', currentUser)]
    names = 'You'
  } else {
    avatarUrls = filteredParticipants.map(p => p.avatarUrl)
    names = formatNames(filteredParticipants.map(p => p.name), maxShown)
  }

  return { names, avatarUrls }
}

export function unreadCount ({ messages: { items: messages }, lastReadTime: lastReadTimeString }) {
  if (!messages || !lastReadTimeString) return 0

  // TODO: Replace with the following once link tagging with ISO dates is working again in DNA:
  // const lastReadTime = new Date(lastReadTimeString)
  const lastReadTime = new Date(Number(lastReadTimeString) * 1000)
  let count = -1

  messages.forEach(message => {
    if (new Date(message.createdAt) > lastReadTime) {
      count += 1
    }
  })

  return count < 0 ? 0 : count
}

export function isUnread (messageThread) {
  return unreadCount(messageThread) > 0
}

export function markAsRead (messageThreadInstance) {
  messageThreadInstance.update({
    unreadCount: 0,
    lastReadAt: new Date().toISOString()
  })

  return messageThreadInstance
}

// ReduxORM Model

const MessageThread = Model.createClass({
  isUnread () {
    return isUnread(this)
  },

  toString () {
    return `MessageThread: ${this.id}`
  },

  markAsRead () {
    return markAsRead(this)
  },

  participantAttributes (currentUser, maxShown) {
    return participantAttributes(this, currentUser, maxShown)
  }
})

export default MessageThread

MessageThread.modelName = 'MessageThread'

MessageThread.fields = {
  id: attr(),
  lastReadTime: attr(),
  participants: many('Person')
}

// Utility

export function formatNames (names, maxShown) {
  const length = names.length
  const truncatedNames = (maxShown && maxShown < length)
    ? names.slice(0, maxShown).concat([others(length - maxShown)])
    : names

  const last = truncatedNames.pop()
  if (isEmpty(truncatedNames)) {
    return last
  } else {
    return truncatedNames.join(', ') + ` and ${last}`
  }
}

export function others (n) {
  if (n < 0) {
    return ''
  } else if (n === 1) {
    return '1 other'
  } else {
    return `${n} others`
  }
}
