import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { get, pick, compose } from 'lodash/fp'
import HolochainCommunityQuery from 'graphql/queries/HolochainCommunityQuery.graphql'
import { HOLOCHAIN_POLL_INTERVAL_SLOW } from 'util/holochain'

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
      fetchPosts: since => {
        console.log('!!!! here since!!!!', since)
        return fetchMore({
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
            limit: 10,
            // TODO: Update to oldest known post timestamp
            since
          }
        })
      }
    }
  },
  options: props => ({
    variables: {
      slug: get('fetchPostsParam.slug', props),
      withPosts: true,
      limit: 10,
      // TODO: Update to oldest known post timestamp
      since: '2020-02-17T06:56:08+00:00'
    },
    pollInterval: HOLOCHAIN_POLL_INTERVAL_SLOW
    // Will need to change/be refactored once pagination is introduced
    // fetchPolicy: 'cache-only'
  })
})

export default compose(
  connect(mapStateToProps),
  posts
)
