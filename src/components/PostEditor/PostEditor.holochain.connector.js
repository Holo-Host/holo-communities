import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { push } from 'connected-react-router'
import { postUrl } from 'util/navigation'
import { pick, get, compose } from 'lodash/fp'
import HolochainCommunityQuery from 'graphql/queries/HolochainCommunityQuery.graphql'
import HolochainCreatePostMutation from 'graphql/mutations/HolochainCreatePostMutation.graphql'
import getRouteParam from 'store/selectors/getRouteParam'
import getPostTypeContext from 'store/selectors/getPostTypeContext'
import getQuerystringParam from 'store/selectors/getQuerystringParam'
import getMe from 'store/selectors/getMe'

export function mapStateToProps (state, props) {
  const currentUser = getMe(state)
  const routeParams = get('match.params', props)
  const postTypeContext = getPostTypeContext(null, props) || getQuerystringParam('t', null, props)

  return {
    currentUser,
    routeParams,
    postTypeContext,
    // not used by holochain
    announcementSelected: null,
    conModerate: null,
    isProject: null,
    isEvent: null,
    linkPreview: null,
    linkPreviewStatus: null,
    fetchLinkPreviewPending: null,
    topic: null,
    topicName: null,
    setAnnouncement: () => {},
    pollingFetchLinkPreview: () => {},
    removeLinkPreview: () => {},
    clearLinkPreview: () => {},
    updatePost: () => {},
    createPost: () => {},
    holochainCreatePost: () => {},
    createProject: () => {}
  }
}

export const mapDispatchToProps = (dispatch, props) => {
  return {
    goToUrl: url => dispatch(push(url))
  }
}

export const currentCommunity = graphql(HolochainCommunityQuery, {
  props: ({ data: { community, loading } }) => ({
    currentCommunity: community,
    post: null,
    communityOptions: [community],
    loading,
    editing: loading
  }),
  options: props => ({
    variables: {
      slug: getRouteParam('slug', {}, props)
    },
    fetchPolicy: 'cache-only'
  })
})

export const createPost = graphql(HolochainCreatePostMutation, {
  props: ({ mutate, ownProps }) => ({
    createPost: post => {
      console.log('!!! post in createPost mutation Apollo:', post)
      return mutate({
        variables: {
          ...pick([
            'type',
            'title',
            'details'
          ], post),
          postToGroupIds: post.communities.map(c => c.id)
        },
        // NOTE: Replaced this with update below
        // refetchQueries: [{
        //   query: HolochainCommunityQuery,
        //   variables: {
        //     slug: getRouteParam('slug', {}, ownProps)
        //   }
        // }],
        update: (proxy, { data: { createPost } }) => {
          const slug = getRouteParam('slug', {}, ownProps)
          const post = { ...createPost, __typename: 'Post' }
          const data = proxy.readQuery({
            query: HolochainCommunityQuery,
            variables: {
              slug,
              withPosts: true
            }
          })
          data.community.posts.items.unshift(post)
          proxy.writeData({ data })
        }
      })
    },
    // postPending: TBD
    goToPost: props => {
      const { slug, postTypeContext } = ownProps.routeParams
      return ownProps.goToUrl(postUrl(props.data.createPost.id, { slug, postTypeContext }))
    }
  })
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  currentCommunity,
  createPost
)
