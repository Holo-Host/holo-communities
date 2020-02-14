import HyloDnaInterface from 'data-interfaces/HyloDnaInterface'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
import { getRandomUuid } from 'util/holochain'
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
      return dataMappedCall('messageThread', participantIds, HyloDnaInterface.messages.createThread)
    },

    async createMessage (_, { data: messageData }) {
      return dataMappedCall('message', messageData, HyloDnaInterface.messages.createMessage)
    },

    async offerHolofuel (_, offerHolofuel) {
      const { counterpartyId, amount, notes } = offerHolofuel

      return HoloFuelDnaInterface.offers.create(counterpartyId, amount, notes)
    }
  },

  Query: {
    async me () {
      return toUiData('person', await HyloDnaInterface.currentUser.get())
    },

    async communities () {
      const communities = await HyloDnaInterface.communities.all()

      return communities.map(community => toUiData('community', community))
    },

    async community (_, { slug }) {
      return toUiData('community', await HyloDnaInterface.communities.getBySlug(slug))
    },

    async post (_, { id }) {
      return toUiData('post', await HyloDnaInterface.posts.get(id))
    },

    async people () {
      const people = await HyloDnaInterface.people.all()

      return toUiQuerySet(people.map(person =>
        toUiData('person', person)
      ))
    },

    async person (_, { id }) {
      return toUiData('person', await HyloDnaInterface.people.get(id))
    },

    async messageThreads () {
      const messageThreads = await HyloDnaInterface.messages.allThreads()

      return toUiQuerySet(messageThreads.map(messageThread =>
        toUiData('messageThread', messageThread)
      ))
    },

    async messageThread (_, { id }) {
      return toUiData('messageThread', await HyloDnaInterface.messages.getThread(id))
    }
  },

  Comment: {
    async creator ({ creator }, _, { HyloDnaInterfaceLoaders }) {
      return toUiData('person', await HyloDnaInterfaceLoaders.person.load(creator))
    },

    async post ({ postId: id }) {
      return { id }
    }
  },

  Community: {
    async posts ({ id }, { limit, since }) {
      const postsQueryset = await HyloDnaInterface.posts.all(id, { limit, since })

      return toUiQuerySet(
        postsQueryset.posts.map(post => toUiData('post', post)),
        { hasMore: postsQueryset.more }
      )
    }
  },

  Me: {
    async memberships () {
      const communities = await HyloDnaInterface.communities.all()

      return communities.map(community => ({
        id: getRandomUuid(),
        community: toUiData('community', community)
      }))
    }
  },

  Message: {
    async creator ({ creator }) {
      return toUiData('person', await HyloDnaInterface.people.get(creator))
    }
  },

  MessageThread: {
    async messages ({ id }) {
      const messages = await HyloDnaInterface.messages.allMessagesForThread(id)

      return toUiQuerySet(messages.map(message =>
        toUiData('message', message)
      ))
    },

    async participants ({ participants }) {
      return participants.map(participant => toUiData('person', participant))
    }
  },

  Post: {
    async communities ({ communityId }) {
      return [
        toUiData('community', await HyloDnaInterface.communities.get(communityId))
      ]
    },

    async creator ({ creator }, _, { HyloDnaInterfaceLoaders }) {
      return toUiData('person', await HyloDnaInterfaceLoaders.person.load(creator))
    },

    async comments ({ id }, _, { HyloDnaInterfaceLoaders }) {
      const zomeComments = await HyloDnaInterfaceLoaders.comments.load(id)

      return toUiQuerySet(zomeComments.map(comment =>
        toUiData('comment', comment)
      ))
    },

    async commenters ({ id }, _, { HyloDnaInterfaceLoaders }) {
      const comments = await HyloDnaInterfaceLoaders.comments.load(id)
      const commenterAddresses = []
      const commenters = await Promise.all(comments.map(({ creator }) => {
        if (commenterAddresses.includes(creator)) return null
        commenterAddresses.push(creator)

        return HyloDnaInterfaceLoaders.person.load(creator)
      }))

      return commenters
        .filter(commenter => !!commenter)
        .map(commenter => toUiData('person', commenter))
    },

    async commentersTotal ({ id }, _, { HyloDnaInterfaceLoaders }) {
      const comments = await HyloDnaInterfaceLoaders.comments.load(id)
      const commenterAddresses = comments.map(comment => comment.creator)

      return new Set(commenterAddresses).size
    }
  }
}

export default resolvers
