import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'
import { registerHolochainSignals } from '../client/holochainClient'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

registerHolochainSignals({
  'new_post': signal => console.log('new_post signal:', signal)
})

export default schema
