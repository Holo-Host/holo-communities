import DataLoader from 'dataloader'
import HoloCommunitiesDnaInterface from './HoloCommunitiesDnaInterface'

export const HoloCommunitiesDnaInterfaceLoaders = () => ({
  comments: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HoloCommunitiesDnaInterface.comments.all(id)))
  }),

  person: new DataLoader(async ids => {
    return Promise.all(ids.map(id => HoloCommunitiesDnaInterface.people.get(id)))
  })
})

export default HoloCommunitiesDnaInterfaceLoaders
