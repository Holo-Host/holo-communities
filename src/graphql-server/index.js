import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'
import registerHolochainSignals from './registerHolochainSignals'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

registerHolochainSignals()

export default schema
