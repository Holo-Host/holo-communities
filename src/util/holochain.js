export const HOLOCHAIN_ACTIVE = true
// TODO: FIX THIS! for some reason this RegEx isn't working with routing
// export const HOLOCHAIN_HASH_MATCH = `([0-9]{1,4},)+[0-9]{1,4}`
export const HOLOCHAIN_HASH_MATCH = `.+`
export const HOLOCHAIN_POLL_INTERVAL_SLOW = 25000
export const HOLOCHAIN_POLL_INTERVAL_FAST = 5000

// const conductorPortMatch = window.location.host.split('.')[0].match(/\d{4,6}/)

export const HOLOCHAIN_DEFAULT_COMMUNITY_SLUG = 'holochain'
export const HOLOCHAIN_WEBSOCK_URI_DEFAULT = 'ws://localhost'
export const HOLOCHAIN_WEBSOCK_PORT_DEFAULT = '3400'
export const HOLOCHAIN_WEBSOCKET_URI = 'ws://localhost:14202'
// HOLOCHAIN_WEBSOCK_URI_DEFAULT + ':' +
//   (conductorPortMatch ? conductorPortMatch[0] : HOLOCHAIN_WEBSOCK_PORT_DEFAULT)

export function currentDataTimeIso () {
  return new Date().toISOString()
}

export function getRandomUuid () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 132,41,36,62,255,249,179,28,229,146,98,219,248,149,56,165,26,170,160,142,57,142,236,85,230,235,209,192,205,35,41,153,110,78,157,171,154,117,127
// export const HOLOCHAIN_HASH_MATCH = '^[0-9]+(,[0-9]+)*$'
// export const HOLOCHAIN_HASH_MATCH ='^([^0-9]+\,[^0-9]+)+$/'
// export const HOLOCHAIN_HASH_MATCH = '^([0-9]+,){20}'
// export const HOLOCHAIN_HASH_MATCH = '[a-zA-Z0-9]{46}'
// export const HOLOCHAIN_HASH_MATCH = '^([0-9]{1,4},)+[0-9]{1,4}$'
