import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { push } from 'connected-react-router'
import { addCommunityDomain } from '../CreateCommunity.store'
import { get, compose, isEmpty } from 'lodash/fp'
import gql from 'graphql-tag'

export function mapStateToProps (state, props) {
  return {
    communityDomain: get('domain', state.CreateCommunity),
    communityDomainExists: get('domainExists', state.CreateCommunity),
    fetchCommunityExists: () => {}
  }
}

export function mapDispatchToProps (dispatch, props) {
  return {
    goToNextStep: () => dispatch(push('/create-community/review')),
    goToPreviousStep: () => dispatch(push('/create-community/name')),
    addCommunityDomain: (domain) => dispatch(addCommunityDomain(domain)),
    goHome: (slug) => dispatch(push('/'))
  }
}

export const CommunityExistsGraphql = gql`
query CommunityExistsQuery ($slug: String) {
  communityExists (slug: $slug) {
    exists
  }
}
`

export const fetchCommunityExists = graphql(CommunityExistsGraphql, {
  skip: props => !props.communityDomain || isEmpty(props.communityDomain),
  options: (props, { communityDomain }) => {
    return {
      variables: {
        slug: communityDomain
      }
      // fetchPolicy: 'cache-only'
    }
  }
})

// , {
//   // props: ({ data: { communityExists }, ownProps }) => {
//   //   console.log('!!! communityExists', communityExists)
//   //   return {
//   //     communityExists
//   //   }
//   // },
//   // options: props => {
//   //   return {
//   //     variables: {
//   //       slug: props.communityDomain
//   //     },
//   //     // fetchPolicy: 'cache-only'
//   //   }
//   // }
//   // options: {
//   //   pollInterval: HOLOCHAIN_POLL_INTERVAL_FAST
//   // }
// }
// )

// export const fetchCommunityExists = graphql(CommunityExistsGraphql, {
//   props: ({ data: { communityExists } }) => ({
//     communityExists
//   }),
//   options: props => {
//     return {
//       variables: {
//         // slug: props.
//       },
//       fetchPolicy: 'cache-only'
//     }
//   }
// })

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  fetchCommunityExists
)
