import HoloCommunitiesDnaInterface from 'data-interfaces/HoloCommunitiesDnaInterface'
import { getRandomUuid } from 'util/holochain'
import {
  toUiData,
  toUiQuerySet,
  dataMappedCall
} from './dataMapping'

export const resolvers = {
  Mutation: {
    async registerUser (_, providedRegisterUserData = {}) {
      const registerUserData = {
        name: 'Loren Johnson',
        avatar_url: 'https://d3ngex8q79bk55.cloudfront.net/evo-uploads/user/22955/userAvatar/22955/2A0E7E57-C815-4524-8EA4-F2FB93C3A213.jpg',
        ...providedRegisterUserData
      }

      return dataMappedCall('person', registerUserData, HoloCommunitiesDnaInterface.currentUser.create)
    },

    async createCommunity (_, { data: createCommunityData }) {
      // return dataMappedCall('community', createCommunityData, HoloCommunitiesDnaInterface.communities.create)
    },

    async createPost (_, { data: createPostData }) {
      console.log('!!! postRecord:', createPostData)
      return dataMappedCall('post', createPostData, HoloCommunitiesDnaInterface.posts.create)
    },

    async createComment (_, { data: createCommentData }) {
      return dataMappedCall('comment', createCommentData, HoloCommunitiesDnaInterface.comments.create)
    },

    async findOrCreateMessageThread (_, { data: findOrCreateMessageThreadData }) {
      return dataMappedCall('messageThread', findOrCreateMessageThreadData, HoloCommunitiesDnaInterface.messages.createMessageThread)
    },

    async createMessage (_, { data: createMessageData }) {
      return dataMappedCall('message', createMessageData, HoloCommunitiesDnaInterface.messages.createMessage)
    },

    async setMessageThreadLastReadTime (_, { data: setMessageThreadLastReadTimeData }) {
      return dataMappedCall('messageThread', setMessageThreadLastReadTimeData, HoloCommunitiesDnaInterface.messages.setLastReadTime)
    }
  },

  Query: {
    async me () {
      return toUiData('person', await HoloCommunitiesDnaInterface.currentUser.get())
    },

    async communityExists (_, { slug }) {
      console.log('!!! here', slug)
      return { communityExists: false }
    },

    async communities () {
      const communities = await HoloCommunitiesDnaInterface.communities.get_group()

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
    async creator ({ creator }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      return toUiData('person', await HoloCommunitiesDnaInterfaceLoaders.person.load(creator))
    }
  },

  MessageThread: {
    async messages ({ id }) {
      const messages = await HoloCommunitiesDnaInterface.messages.allMessagesForThread(id)

      return toUiQuerySet(messages.map(message =>
        toUiData('message', message)
      ))
    },

    async participants ({ participantIds }, _, { HoloCommunitiesDnaInterfaceLoaders }) {
      return Promise.all(
        participantIds.map(
          async participantId => toUiData('person', await HoloCommunitiesDnaInterfaceLoaders.person.load(participantId))
        )
      )
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
