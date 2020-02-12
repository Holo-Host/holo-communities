export const HOLOCHAIN_ACTIVE = true
export const HOLOCHAIN_HASH_MATCH = '[a-zA-Z0-9]{46}'
export const HOLOCHAIN_POLL_INTERVAL_SLOW = 25000
export const HOLOCHAIN_POLL_INTERVAL_FAST = 5000

const conductorPortMatch = window.location.host.split('.')[0].match(/\d{4,6}/)

export const HOLOCHAIN_DEFAULT_COMMUNITY_SLUG = 'hylo-holochain'
export const HOLOCHAIN_WEBSOCK_URI_DEFAULT = 'ws://localhost'
export const HOLOCHAIN_WEBSOCK_PORT_DEFAULT = '3400'
export const HOLOCHAIN_WEBSOCKET_URI = HOLOCHAIN_WEBSOCK_URI_DEFAULT + ':' +
  (conductorPortMatch ? conductorPortMatch[0] : HOLOCHAIN_WEBSOCK_PORT_DEFAULT)

export function currentDateString () {
  return new Date().toISOString()
}

export function getRandomUuid () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
