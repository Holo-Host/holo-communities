// import { useEffect } from 'react'
// import { useApolloClient } from '@apollo/react-hooks'
// import { toUiData } from 'graphql-server/dataMapping'
// import { registerHolochainSignals } from 'graphql-server/holochainClient'
// import HolochainPostQuery from 'graphql/queries/HolochainPostQuery.graphql'

export default function HolochainSignalsSubscriber () {
  // const client = useApolloClient()

  // useEffect(() => {
  //   (async () => {
  //     registerHolochainSignals({
  //       'new_post': signal => console.log('new_post signal:', signal),

  //       'new_comment': ({ args }) => {
  //         const newComment = {
  //           ...toUiData('comment', args),
  //           attachments: [],
  //           __typename: 'Comment',
  //           creator: {
  //             id: args.creator,
  //             name: '(loading)',
  //             avatarUrl: '',
  //             __typename: 'Person'
  //           }
  //         }
  //         const { post } = client.readQuery({
  //           query: HolochainPostQuery,
  //           variables: {
  //             id: args.base
  //           }
  //         })
  //         const ammendedPost = {
  //           post: {
  //             ...post,
  //             __typename: 'Post',
  //             comments: {
  //               ...post.comments,
  //               items: [
  //                 ...post.comments.items,
  //                 newComment
  //               ]
  //             }
  //           }
  //         }
  //         client.writeQuery({
  //           query: HolochainPostQuery,
  //           data: ammendedPost
  //         })
  //       },

  //       'new_message': signal => console.log('new_message signal:', signal),

  //       'new_thread': signal => console.log('new_thread signal:', signal)
  //     })
  //   })()
  // }, [])

  return null
}
