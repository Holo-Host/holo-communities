import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { RetryLink } from 'apollo-link-retry'
import { InMemoryCache } from 'apollo-cache-inmemory'
import DataLoader from 'dataloader'
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
