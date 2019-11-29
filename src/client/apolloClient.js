import { ApolloClient } from 'apollo-client'
import apolloLogger from 'apollo-link-logger'
import { InMemoryCache } from 'apollo-cache-inmemory'
import resolvers from '../graphql-server/resolvers'
import typeDefs from '../graphql-server/schema.graphql'

const apolloClient = new ApolloClient({
  link: apolloLogger,
  resolvers,
  typeDefs,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
