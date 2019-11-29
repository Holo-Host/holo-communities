import HyloDnaInterface from './HyloDnaInterface'
import {
  toUiData,
  toUiQuerySet,
  dataMappedCall
} from './dataMapping'

export const resolvers = {
  Mutation: {
    async registerUser (_, userData) {
      return dataMappedCall('person', userData, HyloDnaInterface.currentUser.create)
    },

    async createCommunity (_, { data: communityData }) {
      return dataMappedCall('community', communityData, HyloDnaInterface.communities.create)
    },

    async createPost (_, { data: postData }) {
      return dataMappedCall('post', postData, HyloDnaInterface.posts.create)
    },

    async createComment (_, { data: commentData }) {
      return dataMappedCall('comment', commentData, HyloDnaInterface.comments.create)
    },

    async findOrCreateThread (_, { data: { participantIds } }) {
      return dataMappedCall('messageThread', participantIds, HyloDnaInterface.messageThreads.create)
    },

    async createMessage (_, { data: messageData }) {
      return dataMappedCall('message', messageData, HyloDnaInterface.messages.create)
    }
  },

  Query: {
    async me () {
      return {
        __typename: 'Me',
        ...toUiData('person', await HyloDnaInterface.currentUser.get())
      }
    },

    async communities () {
      const communities = await HyloDnaInterface.communities.all()

      return communities.map(community => ({
        __typename: 'Community',
        ...toUiData('community', community)
      }))
    },

    async community (_, { slug }) {
      return {
        __typename: 'Community',
        ...toUiData('community', await HyloDnaInterface.communities.getBySlug(slug))
      }
    },

    async post (_, { id }) {
      return {
        __typename: 'Post',
        ...toUiData('post', await HyloDnaInterface.posts.get(id))
      }
    },

    async people () {
      const people = await HyloDnaInterface.people.all()

      return toUiQuerySet(people.map(person => ({
        __typename: 'Person',
        ...toUiData('person', person)
      })), 'PeopleQuerySet')
    },

    async messageThread (_, { id }) {
      return {
        __typename: 'MessageThread',
        ...toUiData('messageThread', await HyloDnaInterface.messageThreads.get(id))
      }
    }
  },

  Comment: {
    async creator ({ creator }) {
      return {
        __typename: 'Person',
        ...toUiData('person', await HyloDnaInterface.people.get(creator))
      }
    }
  },

  Community: {
    async posts ({ id }) {
      const posts = await HyloDnaInterface.posts.all(id)

      return toUiQuerySet(posts.map(post => ({
        __typename: 'Post',
        ...toUiData('post', post)
      })), 'PostQuerySet')
    }
  },

  Me: {
    async messageThreads () {
      const messageThreads = await HyloDnaInterface.messageThreads.all()

      return toUiQuerySet(messageThreads.map(messageThread => ({
        __typename: 'MessageThread',
        ...toUiData('messageThread', messageThread)
      })), 'MessageThreadQuerySet')
    },

    async memberships () {
      const communities = await HyloDnaInterface.communities.all()

      return communities.map(community => ({
        id: Math.round(Math.random() * 10000),
        __typename: 'Membership',
        community: {
          __typename: 'Community',
          ...toUiData('community', community)
        }
      }))
    }
  },

  Message: {
    async creator ({ creator }) {
      return {
        __typename: 'Person',
        ...toUiData('person', await HyloDnaInterface.people.get(creator))
      }
    }
  },

  MessageThread: {
    async messages ({ id }) {
      const messages = await HyloDnaInterface.messages.all(id)

      return toUiQuerySet(messages.map(message => ({
        __typename: 'Message',
        ...toUiData('message', message)
      })), 'MessagesQuerySet')
    },

    async participants ({ participants }) {
      return participants.map(participant => ({
        __typename: 'Person',
        ...toUiData('person', participant)
      }))
    }
  },

  Post: {
    async communities ({ communityId }) {
      return [
        {
          __typename: 'Community',
          ...toUiData('community', await HyloDnaInterface.communities.get(communityId))
        }
      ]
    },

    async creator ({ creator }) {
      return {
        __typename: 'Person',
        ...toUiData('person', await HyloDnaInterface.people.get(creator))
      }
    },

    async comments ({ id }) {
      const zomeComments = await HyloDnaInterface.comments.all(id)

      return toUiQuerySet(zomeComments.map(comment => ({
        __typename: 'Comment',
        ...toUiData('comment', comment)
      })), 'CommentQuerySet')
    },

    async commenters ({ id }) {
      const comments = await HyloDnaInterface.comments.all(id)
      const commenterAddresses = []
      const commenters = await Promise.all(comments.map(({ creator }) => {
        if (commenterAddresses.includes(creator)) return null
        commenterAddresses.push(creator)

        return {
          __typename: 'Person',
          ...HyloDnaInterface.people.get(creator)
        }
      }))

      return commenters
        .filter(commenter => !!commenter)
        .map(commenter => ({
          __typename: 'Person',
          ...toUiData('person', commenter)
        }))
    },

    async commentersTotal ({ id }) {
      const comments = await HyloDnaInterface.comments.all(id)
      const commenterAddresses = comments.map(comment => comment.creator)

      return new Set(commenterAddresses).size
    }
  }
}

export default resolvers
