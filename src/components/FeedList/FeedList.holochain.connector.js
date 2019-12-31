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
      hasMore: get('posts.hasMore', community),
      pending: loading,
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
          withPosts: true,
          limit: 3,
          since: get('id', posts[posts.length - 1])
        }
      })
    }
  },
  options: props => ({
    variables: {
      slug: get('fetchPostsParam.slug', props),
      withPosts: true,
      limit: 3
    }
  })
})

export default compose(
  connect(mapStateToProps),
  posts
)
