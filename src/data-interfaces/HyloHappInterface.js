import { instanceCreateZomeCall } from 'client/holochain'
import { currentDataTimeIso } from 'util/holochain'

const createZomeCall = instanceCreateZomeCall('__hylo')

export const HyloHappInterface = {
  comments: {
    create: createData => createZomeCall('comments/create_comment')({
      ...createData,
      timestamp: currentDataTimeIso()
    }),
    all: base => createZomeCall('comments/all_for_base')({ base }),
    get: address => createZomeCall('comments/get')({ address })
  },

  groups: {
    create: createZomeCall('groups/create_group'),
    all: async () => createZomeCall('groups/all')(null),
    get: address => createZomeCall('groups/get')({ address }),
    getBySlug: slug => createZomeCall('groups/get_by_slug')({ slug })
  },

  currentUser: {
    create: async personAttribs => createZomeCall('people/create')(personAttribs),
    get: async () => createZomeCall('people/get')(null)
  },

  messages: {
    createMessageThread: async createMessageThreadData => createZomeCall('messages/create_thread')({
      ...createMessageThreadData,
      timestamp: currentDataTimeIso()
    }),

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

    get: createZomeCall('people/get')
  },

  posts: {
    create: createData => {
      return createZomeCall('posts/create_post')(createData)
    },

    // TODO: Remove underscores on unused pagination vars _from_time and _limit once DNA is ready
    // TODO: Change DNA to receive integer instead of string for limit
    all: (base, { limit, since }) => {
      const fromTime = since || currentDataTimeIso()

      return createZomeCall('posts/all_for_base')({ base, from_time: fromTime, limit: Number(limit) })
    },

    get: address => createZomeCall('posts/get')({ address })
  }
}

export default HyloHappInterface

// console.log('~~~~ result', result)

// console.log('!!! fakePubKey', fakeAgentPubKey())
// const myKey = await myPubKey()
// console.log('!!! myPubKey', myKey)

// https://docs.rs/holochain_deterministic_integrity/latest/holochain_deterministic_integrity/hash/index.html#valid-holochain-hash-types
// https://github.com/holochain/holochain-client-js/blob/develop/test/e2e/index.ts
// https://discord.com/channels/919686143581253632/919686143581253639/973428081375195136
// https://github.com/holochain-open-dev/wiki/wiki/How-To-Pass-A-String-to-a-Client-Instead-of-A-Buffer-for-Hashes
// https://developer.mozilla.org/en-US/docs/Web/API/btoa
// console.log('!!!! myKey', myKey)
// console.log('!!!! string agent_pub_key1:', Buffer.from(myKey).toString('base64'))
// console.log('!!!! string agent_pub_key2:', Buffer.from(myKey, 'base64').toString('base64'))
// console.log('!!!! base64 agent_pub_key:', Buffer.from(myKey, 'base64'))

//   {
//   name: 'Current Holochain Agent',
//   avatar_url: 'https://d3ngex8q79bk55.cloudfront.net/evo-uploads/user/22955/userAvatar/22955/2A0E7E57-C815-4524-8EA4-F2FB93C3A213.jpg'
// }
// )

// result.agent_pub_key = decode(result.agent_pub_key)
// result.agent_pub_key = await myPubKey().toString()

// console.log('!!!! result - processed:', result)

// const fakeAgentPubKey = () => Buffer.from(
//   [0x84, 0x20, 0x24].concat(
//     "000000000000000000000000000000000000"
//       .split("")
//       .map((x) => parseInt(x, 10))
//   )
// )
