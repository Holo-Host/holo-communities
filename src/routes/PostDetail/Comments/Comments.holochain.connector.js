import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { get, compose, uniqBy } from 'lodash/fp'
import getMe from 'store/selectors/getMe'
import { currentDateString } from 'util/holochain'
import HolochainCreateCommentMutation from 'graphql/mutations/HolochainCreateCommentMutation.graphql'
import HolochainPostQuery from 'graphql/queries/HolochainPostQuery.graphql'
import HolochainCommunityQuery from 'graphql/queries/HolochainCommunityQuery.graphql'

export function mapStateToProps (state, props) {
  return {
    currentUser: getMe(state)
  }
}

const comments = graphql(HolochainPostQuery, {
  props: ({ data: { post, loading } }) => {
    const comments = get('comments.items', post)

    return {
      comments,
      total: comments ? comments.length : 0,
      loading
    }
  },
  options: props => ({
    variables: {
      id: props.postId
    },
    fetchPolicy: 'cache-only'
  })
})

const createComment = graphql(HolochainCreateCommentMutation, {
  props: ({ mutate, ownProps }) => {
    return {
      createComment: async (text) => {
        await mutate({
          variables: {
            postId: ownProps.postId,
            text,
            createdAt: currentDateString()
          },
          update: (proxy, { data: { createComment } }) => {
            const { post } = proxy.readQuery({
              query: HolochainPostQuery,
              variables: { id: createComment.post.id }
            })
            const newComment = {
              ...createComment,
              attachments: []
            }
            const ammendedPost = {
              post: {
                ...post,
                commentersTotal: post.commentersTotal + 1,
                commenters: uniqBy('id', [...post.commenters, newComment.creator]),
                comments: {
                  ...post.comments,
                  items: [
                    ...post.comments.items,
                    newComment
                  ]
                }
              }
            }
            proxy.writeQuery({
              query: HolochainPostQuery,
              data: ammendedPost
            })
            post.communities.forEach(({ slug }) => {
              const { community } = proxy.readQuery({
                query: HolochainCommunityQuery,
                variables: { slug, withPosts: true }
              })
              proxy.writeQuery({
                query: HolochainCommunityQuery,
                data: {
                  community: {
                    ...community,
                    posts: {
                      ...community.posts,
                      items: community.posts.items.map(p => p.id === post.id ? ammendedPost.post : p)
                    }
                  }
                }
              })
            })
          }
        })
        ownProps.scrollToBottom()
      }
    }
  }

})

export default compose(
  connect(mapStateToProps),
  comments,
  createComment
)
