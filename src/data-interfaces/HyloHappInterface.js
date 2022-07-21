/* eslint-disable camelcase */
import { instanceCreateZomeCall } from 'client/holochain'

const createZomeCall = instanceCreateZomeCall('__hylo')

export function Uint8ArrayStringToUint8Array (uint8ArrayString) {
  return Uint8Array.from(uint8ArrayString.split(',').map(num => parseInt(num, 10)))
}

export const HyloHappInterface = {
  comments: {
    create: createZomeCall('comments/create'),
    all: () => [], // base_action_hash => createZomeCall('comments/all')(base_action_hash),
    get: () => {} // address => createZomeCall('comments/get')(action_hash)
  },

  groups: {
    create: createZomeCall('groups/create_group'),
    all: async () => createZomeCall('groups/all')(null),
    get: action_hash => createZomeCall('groups/get')(action_hash),
    getBySlug: group_slug => createZomeCall('groups/get_by_slug')(group_slug)
  },

  currentUser: {
    create: createZomeCall('people/create'),
    get: async () => createZomeCall('people/get')(null)
  },

  messages: {
    createMessageThread: createZomeCall('messages/create_thread'),
    createMessage: createZomeCall('messages/create_message'),
    setLastReadTime: createZomeCall('messages/set_last_read_time'),
    allThreads: createZomeCall('messages/all_threads'),
    allMessagesForThread: async thread_action_hash => createZomeCall('messages/all_messages_for_thread')({ thread_action_hash }),
    getThread: async thread_action_hash => createZomeCall('messages/get_thread')({ thread_action_hash })
  },

  people: {
    all: createZomeCall('people/all'),
    get: createZomeCall('people/get')
  },

  posts: {
    create: data => {
      console.log('!!! data in HyloHappInterface.posts.create', data)
      const convertedData = {
        ...data,
        to_base_action_hashes: data.to_base_action_hashes.map(Uint8ArrayStringToUint8Array)
      }

      createZomeCall('posts/create')(convertedData)
    },

    // TODO: Remove underscores on unused pagination vars _from_time and _limit once DNA is ready
    // TODO: Change DNA to receive integer instead of string for limit
    all: async (base_action_hash, { limit, since }) => {
      // const fromTime = since || currentDataTimeIso()
      // return createZomeCall('posts/all')({ base, from_time: fromTime, limit: Number(limit) })
      return createZomeCall('posts/all')(Uint8ArrayStringToUint8Array(base_action_hash))
    },

    get: action_hash => createZomeCall('posts/get')(Uint8ArrayStringToUint8Array(action_hash))
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
