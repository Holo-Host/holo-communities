import { FETCH_TOPIC, FETCH_COMMUNITY_TOPIC } from 'store/constants'

const communityTopicQuery =
`query ($communitySlug: String, $topicName: String) {
  communityTopic(communitySlug: $communitySlug, topicName: $topicName) {
    id
    postsTotal
    followersTotal
    topic {
      id
      name
    }
    community {
      id
    }
  }
}`

export function fetchCommunityTopic (topicName, communitySlug) {
  return {
    type: FETCH_COMMUNITY_TOPIC,
    graphql: {
      query: communityTopicQuery,
      variables: {
        topicName,
        communitySlug
      }
    },
    meta: {
      extractModel: 'CommunityTopic'
    }
  }
}

const topicQuery =
`query ($name: String, $id: ID) {
  topic(name: $name, id: $id) {
    id
    name
    postsTotal
    followersTotal
  }
}`

export function fetchTopic (name, id) {
  return {
    type: FETCH_TOPIC,
    graphql: {
      query: topicQuery,
      variables: {
        name,
        id
      }
    },
    meta: {
      extractModel: 'Topic'
    }
  }
}