import { instanceCreateZomeCall } from '../graphql-server/holochainClient'
import { currentDataTimeIso } from 'util/holochain'

const createZomeCall = instanceCreateZomeCall(process.env.COMMUNITY_DNA_INSTANCE_ID)

export const HoloCommunitiesDnaInterface = {
  comments: {
    create: createData => createZomeCall('comments/create')({
      ...createData,
      timestamp: currentDataTimeIso()
    }),

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
    createMessageThread: async createMessageThreadData => {
      const messageThread = await createZomeCall('messages/create_thread')({
        ...createMessageThreadData,
        timestamp: currentDataTimeIso()
      })
      const participants = await Promise.all(messageThread['participant_addresses'].map(
        async participantAddress => HoloCommunitiesDnaInterface.people.get(participantAddress)
      ))

      return {
        ...messageThread,
        participants
      }
    },

    createMessage: createMessageData => createZomeCall('messages/create_message')({
      ...createMessageData,
      timestamp: currentDataTimeIso()
    }),

    setLastReadTime: createZomeCall('messages/set_last_read_time'),

    allThreads: createZomeCall('messages/all_threads'),

    allMessagesForThread: async address => createZomeCall('messages/all_messages_for_thread')({ thread_address: address }),

    getThread: async threadId => createZomeCall('messages/get_thread')({ thread_address: threadId })
  },

  people: {
    all: createZomeCall('people/all'),

    get: agentId => createZomeCall('people/get')({ agent_id: agentId })
  },

  posts: {
    create: createData => createZomeCall('posts/create')({
      ...createData,
      timestamp: currentDataTimeIso()
    }),

    // TODO: Re-introduce pagination here
    all: (base, { limit, since }) => createZomeCall('posts/all_for_base')({ base }),

    get: address => createZomeCall('posts/get')({ address })
  }
}

export default HoloCommunitiesDnaInterface
