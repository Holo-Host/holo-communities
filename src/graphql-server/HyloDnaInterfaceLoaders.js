import DataLoader from 'dataloader'
import HyloDnaInterface from '../graphql-server/HyloDnaInterface'

export const HyloDnaInterfaceLoaders = () => ({
  comments: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HyloDnaInterface.comments.all(id)))
  }),

  person: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HyloDnaInterface.people.get(id)))
  })
})

export default HyloDnaInterfaceLoaders
