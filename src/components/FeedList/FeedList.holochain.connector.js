import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { get, pick, compose } from 'lodash/fp'
import HolochainCommunityQuery from 'graphql/queries/HolochainCommunityQuery.graphql'

export function mapStateToProps (state, props) {
  const fetchPostsParam = {
    filter: props.postTypeFilter,
    ...pick([
      'slug',
      'networkSlug'
    ], props.routeParams),
    ...pick([
      'subject',
      'sortBy',
      'topic'
    ], props)
  }

  return {
    fetchPostsParam,
    storeFetchPostsParam: () => {}
  }
}

export const posts = graphql(HolochainCommunityQuery, {
  props: ({ data: { community, loading, fetchMore }, ownProps }) => {
    const posts = get('posts.items', community)

    return {
      posts,
      pending: loading,
      // Only used in the case of feed pagination, which has not yet been implemented
      hasMore: get('posts.hasMore', community),
      fetchPosts: () => fetchMore({
        updateQuery: (previousResult, { fetchMoreResult, variables }) => ({
          ...previousResult,
          community: {
            ...previousResult.community,
            posts: {
              ...previousResult.community.posts,
              items: [
                ...previousResult.community.posts.items,
                ...fetchMoreResult.community.posts.items
              ]
            }
          }
        }),
        variables: {
          slug: get('fetchPostsParam.slug', ownProps),
          withPosts: true
        }
      })
    }
  },
  options: props => ({
    variables: {
      slug: get('fetchPostsParam.slug', props),
      withPosts: true
    },
    // Will need to change/be refactored once pagination is introduced
    fetchPolicy: 'cache-only'
  })
})

export default compose(
  connect(mapStateToProps),
  posts
)
