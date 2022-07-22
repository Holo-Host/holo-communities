import { decode } from '@msgpack/msgpack'

export default function recordParser (response) {
  return decode(response)
}
