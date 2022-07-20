import { get } from 'lodash/fp'
import { decode } from '@msgpack/msgpack'

export default function recordParser (response) {
  console.log('!!!! response, decoded entry:', response, decode(get('entry.Present.entry', response)))
  const entry = decode(get('entry.Present.entry', response))
  const entryType = get('entry.Present.entry_type', response)

  // Serialize Byte Array agentPubKey to String
  entry.agent_pub_key = entry.agent_pub_key.toString()
  // const uint8array = new TextEncoder().encode(string)

  return entry
  // return {
  //   entry_type: entryType,
  //   entry
  // }
}
