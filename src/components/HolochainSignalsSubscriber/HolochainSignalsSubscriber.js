import { useEffect } from 'react'
import { toUiData } from 'graphql-server/dataMapping'
import { registerHolochainSignals } from 'client/holochainClient'
import HolochainPersonQuery from 'graphql/queries/HolochainPersonQuery.graphql'
import HolochainPostQuery from 'graphql/queries/HolochainPostQuery.graphql'
import { useApolloClient } from '@apollo/react-hooks'

export default function HolochainSignalsSubscriber () {
  const client = useApolloClient()

  useEffect(() => {
    (async () => {
      registerHolochainSignals({
        'new_post': signal => console.log('new_post signal:', signal),
        'new_comment': ({ args }) => {
          const newComment = {
            ...toUiData('comment', args),
            attachments: [],
            __typename: 'Comment',
            creator: {
              id: args.creator,
              name: 'test',
              avatarUrl: '',
              __typename: 'Person'
            }
          }
          const { post } = client.readQuery({
            query: HolochainPostQuery,
            variables: {
              id: args.base
            }
          })
          const ammendedPost = {
            post: {
              ...post,
              __typename: 'Post',
              comments: {
                ...post.comments,
                items: [
                  ...post.comments.items,
                  newComment
                ]
              }
            }
          }
          client.writeQuery({
            query: HolochainPostQuery,
            data: ammendedPost
          })
        },
        'new_message': signal => console.log('new_message signal:', signal),
        'new_thread': signal => console.log('new_thread signal:', signal)
      })
    })()
  }, [])

  return null
}
