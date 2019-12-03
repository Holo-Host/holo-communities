import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { RetryLink } from 'apollo-link-retry'
import { InMemoryCache } from 'apollo-cache-inmemory'
import DataLoader from 'dataloader'
import { forEach } from 'lodash/fp'
import schema from '../graphql-server'
import HyloDnaInterface from '../graphql-server/HyloDnaInterface'

function schemaContext () {
  return {
    loaders: {
      commentsByPostIdLoader: new DataLoader(async ids => {
        return Promise.all(ids.map(id => HyloDnaInterface.comments.all(id)))
      }),

      personByIdLoader: new DataLoader(async ids => {
        return Promise.all(ids.map(id => HyloDnaInterface.people.get(id)))
      })
    }
  }
}

const link = ApolloLink.from([
  apolloLogger,
  new RetryLink(),
  new SchemaLink({ schema, context: schemaContext })
])

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient

// * FOR USING APOLLO FOR BOTH HYLO-NODE API AND HOLOCHAIN CLIENT
// import { HttpLink } from 'apollo-link-http'
// import { split } from 'apollo-link'
// import { get } from 'lodash/fp'
// const link = split(
//   operation => HOLOCHAIN_ACTIVE,
//   new HolochainWebSocketLink({
//     uri: process.env.HOLOCHAIN_WEBSOCKET_URI
//   }),
//   new HttpLink({
//     uri: 'http://localhost:9000/noo/graphql'
//   })
// )
