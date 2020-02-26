import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { RetryLink } from 'apollo-link-retry'
import { InMemoryCache } from 'apollo-cache-inmemory'
import HoloCommunitiesDnaInterfaceLoaders from 'data-interfaces/HoloCommunitiesDnaInterfaceLoaders'
import schema from '../graphql-server'

function schemaContext () {
  return {
    HoloCommunitiesDnaInterfaceLoaders: HoloCommunitiesDnaInterfaceLoaders()
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
