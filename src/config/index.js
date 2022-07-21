import { once } from 'lodash'

export const environment = process.env.NODE_ENV || 'development'
export const isTest = environment === 'test'
export const isDev = environment === 'development'
export const isProduction = environment === 'production'

const isServer = typeof window === 'undefined'

// FIXME: The following is from hylo-redux used for SSR only
//        but our create-react-app heritages manages
//        the loading of .env in the relevant scripts (build and start)
// if (isServer && environment === 'development') {
//   require('dotenv').load({silent: true})
// }

export const logLevel = process.env.LOG_LEVEL
export const socketHost = process.env.SOCKET_HOST
export const host = process.env.HOST

export const featureFlags = () => {
  if (isServer) {
    return once(() =>
      Object.keys(process.env).reduce((flags, key) => {
        if (key.startsWith('FEATURE_FLAG_')) {
          flags[key.replace('FEATURE_FLAG_', '')] = process.env[key]
        }
        return flags
      }, {}))()
  } else {
    return window.FEATURE_FLAGS || {}
  }
}

const config = {
  environment,
  logLevel,
  host,
  featureFlags
}

if (!isServer) window.__appConfig = config

export default config
