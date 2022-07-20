import DataLoader from 'dataloader'
import HyloHappInterface from './HyloHappInterface'

export const HyloHappInterfaceLoaders = () => ({
  comments: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HyloHappInterface.comments.all(id)))
  }),

  person: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HyloHappInterface.people.get(id)))
  })
})

export default HyloHappInterfaceLoaders
