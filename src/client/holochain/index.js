import { HOLOCHAIN_WEBSOCKET_URI } from 'util/holochain'
import { AppWebsocket } from '../../../node_modules/@holochain/client/lib/api/app/websocket'
import recordParser from './recordParser'

const groupLogFormat = 'font-weight: normal; color: rgb(160, 160, 160)'
const detailsLogFormat = 'font-weight: bold; color: rgb(220, 208, 120)'
const successLogFormat = 'font-weight: bold; color: rgb(75,166,238)'
const errorLogFormat = 'font-weight: bold; color: red'

export const HOLOCHAIN_LOGGING = true

export let holochainClient, holochainAppInfo

export async function initAndGetHolochainClient () {
  if (holochainClient) return holochainClient

  try {
    holochainClient = await AppWebsocket.connect(HOLOCHAIN_WEBSOCKET_URI)
    holochainAppInfo = await holochainClient.appInfo({ installed_app_id: 'hylo' })

    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }

  return holochainClient
}

export function parseZomeCallPath (zomeCallPath) {
  const [ zomeFunc, zome, dnaInstanceId ] = zomeCallPath.split('/').reverse()

  return { dnaInstanceId, zome, zomeFunc }
}

export function instanceCreateZomeCall (dnaInstanceId) {
  return (zomeCallPath, callOpts = {}) =>
    createZomeCall(zomeCallPath, { dnaInstanceId, ...callOpts })
}

export async function myPubKey () {
  return holochainAppInfo.cell_data[0].cell_id[1]
}

export function createZomeCall (zomeCallPath, callOpts = {}) {
  const DEFAULT_OPTS = {
    dnaInstanceId: process.env.COMMUNITY_DNA_INSTANCE_ID,
    logging: HOLOCHAIN_LOGGING,
    resultParser: recordParser
  }
  const opts = {
    ...DEFAULT_OPTS,
    ...callOpts
  }

  return async function (args = {}) {
    try {
      const hcClient = await initAndGetHolochainClient()
      const { zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
      const unparsedResponse = await hcClient.callZome({
        cell_id: holochainAppInfo.cell_data[0].cell_id,
        zome_name: zome,
        fn_name: zomeFunc,
        payload: args,
        provenance: await myPubKey(),
        cap: null
      }, 30000)
      const result = opts.resultParser(unparsedResponse)

      if (opts.logging) {
        console.groupCollapsed(`👍 %c${zomeCallPath}%c zome call complete`, successLogFormat, groupLogFormat)
        console.groupCollapsed('%cArgs', detailsLogFormat)
        console.log(args)
        console.groupEnd()
        console.groupCollapsed('%cResult', detailsLogFormat)
        console.log(result)
        console.groupEnd()
        console.groupEnd()
      }
      return result
    } catch (error) {
      console.log(
        `👎 %c${zomeCallPath}%c zome call ERROR using args: `,
        errorLogFormat,
        groupLogFormat,
        args,
        ' -- ',
        error
      )
    }
  }
}

export default holochainClient

// TODO: Not currently used. Needs to be revisited with latest HDK updates.
// export async function onSignal (
//   signalCallback,
//   opts = { logging: HOLOCHAIN_LOGGING }
// ) {
//   const hcClient = await initAndGetHolochainClient()

//   hcClient.onSignal(message => {
//     const { signal: { name, arguments: args } } = message
//     const parsedArgs = JSON.parse(args)

//     if (opts.logging) {
//       const detailsLogFormat = 'font-weight: bold; color: rgb(220, 208, 120)'

//       console.groupCollapsed(
//         `📣 ${name}%c signal received`,
//         'font-weight: normal; color: rgb(160, 160, 160)'
//       )
//       console.groupCollapsed('%cArguments', detailsLogFormat)
//       console.log(parsedArgs)
//       console.groupEnd()
//       console.groupCollapsed('%cRaw Message', detailsLogFormat)
//       console.log(message)
//       console.groupEnd()
//       console.groupEnd()
//     }

//     return signalCallback({ name, args: parsedArgs })
//   })
// }

// export function registerHolochainSignals (signalHandlers = {}) {
//   onSignal(signal => {
//     const signalHandler = get(signal.name, signalHandlers)

//     if (signalHandler) signalHandler(signal)
//   })
// }
