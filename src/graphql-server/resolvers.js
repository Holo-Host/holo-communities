import { myPubKey } from 'client/holochain'
import HyloHappInterface from 'data-interfaces/HyloHappInterface'
import { isEmpty } from 'lodash/fp'
import { getRandomUuid } from 'util/holochain'
import {
  toUiData,
  toUiQuerySet,
  dataMappedCall
} from './dataMapping'

export const resolvers = {
  Mutation: {
    async registerUser (_, registerUserData = {}) {
      return dataMappedCall('person', registerUserData, HyloHappInterface.currentUser.create)
    },

    async createCommunity (_, { data: createCommunityData }) {
      return dataMappedCall('community', createCommunityData, HyloHappInterface.groups.create)
    },

    async createPost (_, { data: createPostData }) {
      const post = {
        announcement: false,
        details: createPostData.details,
        post_type: createPostData.type,
        title: createPostData.title,
        author_pub_key: await myPubKey()
      }
      const data = {
        post,
        to_base_action_hashes: createPostData.postToGroupIds
      }

      return dataMappedCall('post', data, HyloHappInterface.posts.create)
    },

    async createComment (_, { data: createCommentData }) {
      return dataMappedCall('comment', createCommentData, HyloHappInterface.comments.create)
    },

    async findOrCreateMessageThread (_, { data: findOrCreateMessageThreadData }) {
      // return dataMappedCall('messageThread', findOrCreateMessageThreadData, HyloHappInterface.messages.createMessageThread)
    },

    async createMessage (_, { data: createMessageData }) {
      // return dataMappedCall('message', createMessageData, HyloHappInterface.messages.createMessage)
    },

    async setMessageThreadLastReadTime (_, { data: setMessageThreadLastReadTimeData }) {
      // return dataMappedCall('messageThread', setMessageThreadLastReadTimeData, HyloHappInterface.messages.setLastReadTime)
    }
  },

  Query: {
    async me () {
      return toUiData('person', await HyloHappInterface.currentUser.get())
    },

    async communityExists (_, { slug }) {
      console.log('!!! here', slug)
      return { communityExists: false }
    },

    async communities () {
      const communities = await HyloHappInterface.groups.all()

      return communities.map(community => toUiData('community', community))
    },

    async community (_, { slug }) {
      return toUiData('community', await HyloHappInterface.groups.getBySlug(slug))
    },

    async post (_, data) {
      console.log('!!!!! data in post query resolver:', data)
      return toUiData('post', await HyloHappInterface.posts.get(data.id))
    },

    async people () {
      const people = await HyloHappInterface.people.all()

      return toUiQuerySet(people.map(person =>
        toUiData('person', person)
      ))
    },

    async person (_, { id }) {
      return toUiData('person', await HyloHappInterface.people.get(id))
    },

    async messageThreads () {
      // const messageThreads = await HyloHappInterface.messages.allThreads()

      // return toUiQuerySet(messageThreads.map(messageThread =>
      //   toUiData('messageThread', messageThread)
      // ))
    },

    async messageThread (_, { id }) {
      // return toUiData('messageThread', await HyloHappInterface.messages.getThread(id))
    }
  },

  Comment: {
    async creator ({ creator }, _, { HyloHappInterfaceLoaders }) {
      return toUiData('person', await HyloHappInterfaceLoaders.person.load(creator))
    },

    async post ({ postId: id }) {
      return { id }
    }
  },

  Community: {
    async posts ({ id }, { limit, since }) {
      const postsQueryset = await HyloHappInterface.posts.all(id, { limit, since })
      console.log('!!! Community posts query set', postsQueryset)
      return toUiQuerySet(
        postsQueryset.map(post => toUiData('post', post)),
        { hasMore: false }
        // { hasMore: postsQueryset.more }
      )
    }
  },

  Me: {
    async memberships () {
      const communities = await HyloHappInterface.groups.all()

      // TODO: Remove once `HyloHappInterface.groups.all()` is behaving
      if (isEmpty(communities)) return []

      return communities.map(community => ({
        id: getRandomUuid(),
        community: toUiData('community', community)
      }))
    }
  },

  Message: {
    async creator ({ creator }, _, { HyloHappInterfaceLoaders }) {
      return toUiData('person', await HyloHappInterfaceLoaders.person.load(creator))
    }
  },

  MessageThread: {
    async messages ({ id }) {
      // const messages = await HyloHappInterface.messages.allMessagesForThread(id)

      // return toUiQuerySet(messages.map(message =>
      //   toUiData('message', message)
      // ))
    },

    async participants ({ participantIds }, _, { HyloHappInterfaceLoaders }) {
      // return Promise.all(
      //   participantIds.map(
      //     async participantId => toUiData('person', await HyloHappInterfaceLoaders.person.load(participantId))
      //   )
      // )
    }
  },

  Post: {
    async communities ({ communityId }) {
      return [
        toUiData('community', await HyloHappInterface.groups.get(communityId))
      ]
    },

    async creator ({ creator }, _, { HyloHappInterfaceLoaders }) {
      return toUiData('person', await HyloHappInterfaceLoaders.person.load(creator))
    },

    async comments ({ id }, _, { HyloHappInterfaceLoaders }) {
      const zomeComments = await HyloHappInterfaceLoaders.comments.load(id)

      return toUiQuerySet(zomeComments.map(comment =>
        toUiData('comment', comment)
      ))
    },

    async commenters ({ id }, _, { HyloHappInterfaceLoaders }) {
      const comments = await HyloHappInterfaceLoaders.comments.load(id)
      const commenterAddresses = []
      const commenters = await Promise.all(comments.map(({ creator }) => {
        if (commenterAddresses.includes(creator)) return null
        commenterAddresses.push(creator)

        return HyloHappInterfaceLoaders.person.load(creator)
      }))

      return commenters
        .filter(commenter => !!commenter)
        .map(commenter => toUiData('person', commenter))
    },

    async commentersTotal ({ id }, _, { HyloHappInterfaceLoaders }) {
      const comments = await HyloHappInterfaceLoaders.comments.load(id)
      const commenterAddresses = comments.map(comment => comment.creator)

      return new Set(commenterAddresses).size
    }
  }
}

export default resolvers
