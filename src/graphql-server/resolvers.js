import HoloCommunitiesDnaInterface from 'data-interfaces/HoloCommunitiesDnaInterface'
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
      return dataMappedCall('person', userData, HoloCommunitiesDnaInterface.currentUser.create)
    },

    async createCommunity (_, { data: communityData }) {
      return dataMappedCall('community', communityData, HoloCommunitiesDnaInterface.communities.create)
    },

    async createPost (_, { data: postData }) {
      return dataMappedCall('post', postData, HoloCommunitiesDnaInterface.posts.create)
    },

    async createComment (_, { data: commentData }) {
      return dataMappedCall('comment', commentData, HoloCommunitiesDnaInterface.comments.create)
    },

    async findOrCreateThread (_, { data: { participantIds } }) {
      return dataMappedCall('messageThread', participantIds, HoloCommunitiesDnaInterface.messages.createThread)
    },

    async createMessage (_, { data: messageData }) {
      return dataMappedCall('message', messageData, HoloCommunitiesDnaInterface.messages.createMessage)
    },

    async offerHolofuel (_, offerHolofuel) {
      const { counterpartyId, amount, notes } = offerHolofuel

      return HoloFuelDnaInterface.offers.create(counterpartyId, amount, notes)
    }
  },

  Query: {
    async me () {
      return toUiData('person', await HoloCommunitiesDnaInterface.currentUser.get())
    },

    async communities () {
      const communities = await HoloCommunitiesDnaInterface.communities.all()

      return communities.map(community => toUiData('community', community))
    },

    async community (_, { slug }) {
      return toUiData('community', await HoloCommunitiesDnaInterface.communities.getBySlug(slug))
    },

    async post (_, { id }) {
      return toUiData('post', await HoloCommunitiesDnaInterface.posts.get(id))
    },

    async people () {
      const people = await HoloCommunitiesDnaInterface.people.all()

      return toUiQuerySet(people.map(person =>
        toUiData('person', person)
      ))
    },

    async person (_, { id }) {
      return toUiData('person', await HoloCommunitiesDnaInterface.people.get(id))
    },

    async messageThreads () {
      const messageThreads = await HoloCommunitiesDnaInterface.messages.allThreads()

      return toUiQuerySet(messageThreads.map(messageThread =>
        toUiData('messageThread', messageThread)
      ))
    },

    async messageThread (_, { id }) {
      return toUiData('messageThread', await HoloCommunitiesDnaInterface.messages.getThread(id))
    }
  },

  Comment: {
    async creator ({ creator }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      return toUiData('person', await HoloCommunitiesDnaInterfaceLoaders.person.load(creator))
    },

    async post ({ postId: id }) {
      return { id }
    }
  },

  Community: {
    async posts ({ id }, { limit, since }) {
      const postsQueryset = await HoloCommunitiesDnaInterface.posts.all(id, { limit, since })

      return toUiQuerySet(
        postsQueryset.posts.map(post => toUiData('post', post)),
        { hasMore: postsQueryset.more }
      )
    }
  },

  Me: {
    async memberships () {
      const communities = await HoloCommunitiesDnaInterface.communities.all()

      return communities.map(community => ({
        id: getRandomUuid(),
        community: toUiData('community', community)
      }))
    }
  },

  Message: {
    async creator ({ creator }) {
      return toUiData('person', await HoloCommunitiesDnaInterface.people.get(creator))
    }
  },

  MessageThread: {
    async messages ({ id }) {
      const messages = await HoloCommunitiesDnaInterface.messages.allMessagesForThread(id)

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
        toUiData('community', await HoloCommunitiesDnaInterface.communities.get(communityId))
      ]
    },

    async creator ({ creator }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      return toUiData('person', await HoloCommunitiesDnaInterfaceLoaders.person.load(creator))
    },

    async comments ({ id }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      const zomeComments = await HoloCommunitiesDnaInterfaceLoaders.comments.load(id)

      return toUiQuerySet(zomeComments.map(comment =>
        toUiData('comment', comment)
      ))
    },

    async commenters ({ id }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      const comments = await HoloCommunitiesDnaInterfaceLoaders.comments.load(id)
      const commenterAddresses = []
      const commenters = await Promise.all(comments.map(({ creator }) => {
        if (commenterAddresses.includes(creator)) return null
        commenterAddresses.push(creator)

        return HoloCommunitiesDnaInterfaceLoaders.person.load(creator)
      }))

      return commenters
        .filter(commenter => !!commenter)
        .map(commenter => toUiData('person', commenter))
    },

    async commentersTotal ({ id }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      const comments = await HoloCommunitiesDnaInterfaceLoaders.comments.load(id)
      const commenterAddresses = comments.map(comment => comment.creator)

      return new Set(commenterAddresses).size
    }
  }
}

export default resolvers
