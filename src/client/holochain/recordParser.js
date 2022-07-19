import { get } from 'lodash/fp'
import { decode } from '@msgpack/msgpack'

export default function recordParser (response) {
  const entry = decode(get('entry.Present.entry', response))
  const entryType = decode(get('entry.Present.entry_type', response))

  return {
    entry_type: entryType,
    entry
  }
}
