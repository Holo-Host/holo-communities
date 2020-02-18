import { instanceCreateZomeCall } from '../graphql-server/holochainClient'

const createZomeCall = instanceCreateZomeCall(process.env.COMMUNITY_DNA_INSTANCE_ID)

export const HoloCommunitiesDnaInterface = {
  comments: {
    create: createZomeCall('comments/create'),

    all: base => createZomeCall('comments/all_for_base')({ base }),

    get: address => createZomeCall('comments/get')({ address })
  },

  communities: {
    create: createZomeCall('communities/create'),

    all: createZomeCall('communities/all'),

    get: address => createZomeCall('communities/get')({ address }),

    getBySlug: slug => createZomeCall('communities/get_by_slug')({ slug })
  },

  currentUser: {
    create: async user => {
      return {
        ...await createZomeCall('people/register_user')(user),
        isRegistered: true
      }
    },

    get: async () => {
      return {
        ...await createZomeCall('people/get_me')(),
        isRegistered: await createZomeCall('people/is_registered')()
      }
    }
  },

  messages: {
    createMessage: createZomeCall('messages/create_message'),

    createThread: async participantAddresses => {
      const messageThread = await createZomeCall('messages/create_thread')({ participant_ids: participantAddresses })
      const participants = await Promise.all(messageThread['participant_addresses'].map(
        async participantAddress => HoloCommunitiesDnaInterface.people.get(participantAddress)
      ))

      return {
        ...messageThread,
        participants
      }
    },

    setLastReadTime: async (threadId, lastReadTime) => createZomeCall('messages/set_last_read_time')({
      thread_address: threadId,
      last_read_time: lastReadTime
    }),

    allThreads: async () => {
      const messageThreads = await createZomeCall('messages/all_threads')()

      return Promise.all(
        messageThreads.map(async messageThread => HoloCommunitiesDnaInterface.messages.__buildThread(messageThread))
      )
    },

    allMessagesForThread: async address => createZomeCall('messages/all_messages_for_thread')({ thread_address: address }),

    getThread: async threadId => {
      const messageThread = await createZomeCall('messages/get_thread')({ thread_address: threadId })

      return HoloCommunitiesDnaInterface.messages.__buildThread(messageThread)
    },

    __buildThread: async messageThread => {
      const participants = await Promise.all(
        messageThread['participant_addresses'].map(
          async participantId => HoloCommunitiesDnaInterface.people.get(participantId)
        )
      )

      return {
        ...messageThread,
        participants
      }
    }
  },

  people: {
    all: createZomeCall('people/all'),

    get: agentId => createZomeCall('people/get')({ agent_id: agentId })
  },

  posts: {
    create: createZomeCall('posts/create'),

    // TODO: Re-introduce pagination here
    all: (base, { limit, since }) => createZomeCall('posts/all_for_base')({ base }),

    get: address => createZomeCall('posts/get')({ address })
  }
}

export default HoloCommunitiesDnaInterface
