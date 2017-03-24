import transformComment from '../transformers/commentTransformer'
import transformCommunity from '../transformers/communityTransformer'
import transformPost from '../transformers/postTransformer'
import {
  ADD_OR_UPDATE_COMMENT,
  ADD_OR_UPDATE_COMMUNITY,
  ADD_OR_UPDATE_PERSON,
  ADD_OR_UPDATE_POST,
  FETCH_POSTS
} from '../constants'

export default function transformMiddleware ({dispatch, getState}) {
  return next => action => {
    if (action) {
      const { type, payload } = action

      switch (type) {
        case FETCH_POSTS:
          if (payload.length === 0) break
          addRelations(dispatch, payload)
          break
      }
    }
    return next(action)
  }
}

function addPersonIfUnique (people, person) {
  const result = [ ...people ]
  if (!people.find(p => p.id === person.id)) result.push(person)
  return result
}

function addRelations (dispatch, posts) {
  let people = []

  posts.forEach(post => {
    const { comments, communities, followers } = post
    if (comments) {
      comments.forEach(c => {
        people = addPersonIfUnique(people, c.creator)
        dispatch({ type: ADD_OR_UPDATE_COMMENT, payload: transformComment(c) })
      })
    }
    if (communities) {
      communities.forEach(c => {
        if (c.members) {
          c.members.forEach(m => {
            people = addPersonIfUnique(people, m)
          })
        }
        dispatch({ type: ADD_OR_UPDATE_COMMUNITY, payload: transformCommunity(c) })
      })
    }
    if (followers) {
      followers.forEach(f => {
        people = addPersonIfUnique(people, post.creator)
      })
    }
    
    people = addPersonIfUnique(people, post.creator)
    dispatch({ type: ADD_OR_UPDATE_POST, payload: transformPost(post) })
  })
  people.forEach(p => dispatch({ type: ADD_OR_UPDATE_PERSON, payload: p }))
}

