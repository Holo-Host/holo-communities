import { get, isArray } from 'lodash/fp'
import { decode } from '@msgpack/msgpack'

export function decodedEntryFromRecord (record) {
  console.log('!!!! raw zome response (record):', record)
  const entry = decode(get('entry.Present.entry', record))

  if (entry.agent_pub_key) {
    entry.agent_pub_key = entry.agent_pub_key.toString()
  }

  return entry
}

export default function recordParser (response) {
  // Handle array responses differently
  if (isArray(response)) {
    return response.map(decodedEntryFromRecord)
  } else {
    return decodedEntryFromRecord(response)
  }
}

// To ALSO return entry_type:
// const entryType = get('entry.Present.entry_type', response)
// return {
//   entry_type: entryType,
//   entry
// }

// // Serialize Byte Array agentPubKey to String
// entry.agent_pub_key = entry.agent_pub_key.toString()
// const uint8array = new TextEncoder().encode(string)

