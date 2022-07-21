import React, { useEffect } from 'react'
import {
  matchPath,
  Redirect,
  Route,
  Switch
} from 'react-router-dom'
import cx from 'classnames'
import { some } from 'lodash/fp'
// import Intercom from 'react-intercom'
// import config, { isTest } from 'config'
import { isSmallScreen, isMediumScreen } from 'util/responsive'
// import AddLocation from 'routes/Signup/AddLocation'
// import AddSkills from 'routes/Signup/AddSkills'
// import AllTopics from 'routes/AllTopics'
// import CreateCommunity from 'routes/CreateCommunity'
// import CommunityDeleteConfirmation from 'routes/CommunitySettings/CommunityDeleteConfirmation'
// import CommunityReview from 'routes/CreateCommunity/Review'
// import CommunitySettings from 'routes/CommunitySettings'
// import CommunitySidebar from 'routes/CommunitySidebar'
// import Domain from 'routes/CreateCommunity/Domain'
import Drawer from './components/Drawer'
import Feed from 'routes/Feed'
import Loading from 'components/Loading'
// import MemberProfile from 'routes/MemberProfile'
// import MemberSidebar from 'routes/MemberSidebar'
// import Members from 'routes/Members'
import Messages from 'routes/Messages'
// import Navigation from './components/Navigation'
// import Name from 'routes/CreateCommunity/Name'
// import NetworkCommunities from 'routes/NetworkCommunities'
// import NetworkSettings from 'routes/NetworkSettings'
// import NetworkSidebar from 'routes/NetworkSidebar'
import NotFound from 'components/NotFound'
import PostDetail from 'routes/PostDetail'
import PostEditorModal from 'components/PostEditorModal'
// import Review from 'routes/Signup/Review'
// import Search from 'routes/Search'
// import SignupModal from 'routes/Signup/SignupModal'
// import TopicSupportComingSoon from 'components/TopicSupportComingSoon'
import TopNav from './components/TopNav'
import HolochainSignalsSubscriber from 'components/HolochainSignalsSubscriber'
// import UploadPhoto from 'routes/Signup/UploadPhoto'
// import UserSettings from 'routes/UserSettings'
import {
  POST_ID_MATCH,
  VALID_POST_TYPE_CONTEXTS_MATCH,
  isSignupPath,
  // isAllCommunitiesPath,
  // isTagPath,
  defaultHolochainCommunityUrl
} from 'util/navigation'
import { CENTER_COLUMN_ID, DETAIL_COLUMN_ID } from 'util/scrolling'
import { HOLOCHAIN_ACTIVE } from 'util/holochain'
import './PrimaryLayout.scss'

export default function PrimaryLayout ({
  fetchForCurrentUser,
  fetchForCommunity,
  slug,
  community,
  network,
  currentUser,
  isDrawerOpen,
  location,
  toggleDrawer,
  isCommunityRoute,
  communityPending,
  showLogoBadge,
  goBack
}) {
  const smallScreen = isSmallScreen()
  const mediumScreen = isMediumScreen()

  useEffect(() => {
    (async () => { await fetchForCurrentUser() })()
  }, [])

  useEffect(() => {
    (async () => { slug && await fetchForCommunity() })()
  }, [slug])

  if (!currentUser) {
    return <div styleName='container'>
      <Loading type='loading-fullscreen' />
    </div>
  }

  if (isCommunityRoute) {
    if (!community && !communityPending) return <NotFound />
  }

  const closeDrawer = () => isDrawerOpen && toggleDrawer()
  const hasDetail = some(
    ({ path }) => matchPath(location.pathname, { path, exact: true }),
    postDetailRoutes
  )
  // const showTopics = !isAllCommunitiesPath(location.pathname) && !isNetworkPath(location.pathname) && !isTagPath(location.pathname)

  return <div styleName='container'>
    <Drawer styleName={cx('drawer', { hidden: !isDrawerOpen })} {...{ community, network }} />
    <TopNav
      styleName='top'
      onClick={closeDrawer}
      goBack={mediumScreen && hasDetail ? goBack : null}
      {...{ community, network, currentUser, showLogoBadge }} />
    <div styleName='main' onClick={closeDrawer}>
      {/* {!HOLOCHAIN_ACTIVE && <Navigation
        styleName={cx('left', { hidden: smallScreen })}
        collapsed={hasDetail || mediumScreen}
        showTopics={showTopics}
        currentUser={currentUser} />} */}
      <div styleName={cx('center', { hidden: hasDetail && mediumScreen })} id={CENTER_COLUMN_ID}>
        {/* <RedirectToSignupFlow currentUser={currentUser} pathname={location.pathname} /> */}
        <RedirectToCommunity path='/' currentUser={currentUser} />
        {/* <RedirectToCommunity path='/app' currentUser={currentUser} /> */}
        <Switch>
          {/* <Route path='/tag/:topicName' exact component={TopicSupportComingSoon} /> */}
          {/* <Route path={`/all/${OPTIONAL_POST_MATCH}`} exact component={Feed} /> */}
          {/* <Route path='/all/:topicName' exact component={TopicSupportComingSoon} /> */}
          <Route path={`/c/:slug/${OPTIONAL_POST_MATCH}`} exact component={Feed} />
          {/* <Route path='/c/:slug/members' component={Members} /> */}
          {/* <Route path={`/c/:slug/m/:personId/${OPTIONAL_POST_MATCH}`} exact component={MemberProfile} /> */}
          {/* <Route path='/c/:slug/settings' component={CommunitySettings} /> */}
          {/* <Route path='/c/:slug/topics' component={AllTopics} /> */}
          {/* <Route path={`/c/:slug/:topicName/${OPTIONAL_POST_MATCH}`} component={Feed} /> */}
          {/* <Route path={`/m/:personId/${OPTIONAL_POST_MATCH}`} exact component={MemberProfile} /> */}
          {/* <Route path='/settings' component={UserSettings} /> */}
          {/* <Route path='/search' component={Search} /> */}
          {/* <Route path='/confirm-community-delete' component={CommunityDeleteConfirmation} /> */}
          {/* {signupRoutes.map(({ path, child }) =>
            <Route path={path} key={path} component={props =>
              <SignupModal {...props} child={child} />} />)} */}
          {/* {createCommunityRoutes.map(({ path, component }) =>
            <Route path={path} key={path} component={props =>
              <CreateCommunity {...props} component={component} />} />)} */}
        </Switch>
      </div>
      {/* <div styleName={cx('sidebar', { hidden: hasDetail || HOLOCHAIN_ACTIVE })}>
        <Switch>
          <Route path={`/c/:slug${OPTIONAL_NEW_POST_MATCH}`} exact component={CommunitySidebar} />
          <Route path={`/c/:slug/m/:personId/${OPTIONAL_NEW_POST_MATCH}`} component={MemberSidebar} />
          <Route path={`/c/:slug/:topicName/${OPTIONAL_NEW_POST_MATCH}`} exact component={CommunitySidebar} />
          <Route path={`/m/:personId/${OPTIONAL_NEW_POST_MATCH}`} exact component={MemberSidebar} />
        </Switch>
      </div> */}
      <div styleName={cx('detail', { hidden: !hasDetail })} id={DETAIL_COLUMN_ID}>
        <Switch>
          {postDetailRoutes.map(({ path }) =>
            <Route path={path} component={PostDetail} key={path} />)}
        </Switch>
      </div>
    </div>
    <Route path='/t/:messageThreadId?' render={props => <Messages {...props} smallScreen={smallScreen} />} />
    <Switch>
      {postEditorRoutes.map(({ path }) =>
        <Route path={path} key={path} children={({ match, location }) =>
          <PostEditorModal match={match} location={location} />} />)}
    </Switch>
    <HolochainSignalsSubscriber />
  </div>
}

const POST_TYPE_CONTEXT_MATCH = `:postTypeContext(${VALID_POST_TYPE_CONTEXTS_MATCH})`
const OPTIONAL_POST_MATCH = `${POST_TYPE_CONTEXT_MATCH}?/:postId(${POST_ID_MATCH})?/:action(new|edit)?`
// const OPTIONAL_NEW_POST_MATCH = `${POST_TYPE_CONTEXT_MATCH}?/:action(new)?`

const POST_DETAIL_MATCH = `${POST_TYPE_CONTEXT_MATCH}/:postId(${POST_ID_MATCH})/:action(edit)?`
const postDetailRoutes = [
  // { path: `/all/${POST_DETAIL_MATCH}` },
  // { path: `/c/:slug/m/:personId/${POST_DETAIL_MATCH}` },

  { path: `/c/:slug/${POST_DETAIL_MATCH}` },

  // Weird, remove
  { path: `/c/:slug/p/:postId(${POST_ID_MATCH})?` }

  // { path: `/c/:slug/:topicName/${POST_DETAIL_MATCH}` },
  // { path: `/m/:personId/${POST_DETAIL_MATCH}` }
]

const NEW_POST_MATCH = `${POST_TYPE_CONTEXT_MATCH}/:action(new)`
const EDIT_POST_MATCH = `${POST_DETAIL_MATCH}/:action(edit)`
const postEditorRoutes = [
  { path: `/all/${NEW_POST_MATCH}` },
  { path: `/all/${EDIT_POST_MATCH}` },
  { path: `/c/:slug/${NEW_POST_MATCH}` },
  { path: `/c/:slug/${EDIT_POST_MATCH}` },
  { path: `/c/:slug/m/:personId/${EDIT_POST_MATCH}` },
  { path: `/c/:slug/:topicName/${NEW_POST_MATCH}` },
  { path: `/c/:slug/:topicName/${EDIT_POST_MATCH}` },
  { path: `/m/:personId/${EDIT_POST_MATCH}` }
]

// const signupRoutes = [
//   { path: '/signup/upload-photo', child: UploadPhoto },
//   { path: '/signup/add-location', child: AddLocation },
//   { path: '/signup/add-skills', child: AddSkills },
//   { path: '/signup/review', child: Review }
// ]

// const createCommunityRoutes = [
//   { path: '/create-community/name/:networkId', component: Name },
//   { path: '/create-community/name', component: Name },
//   { path: '/create-community/domain', component: Domain },
//   { path: '/create-community/review', component: CommunityReview }
// ]

export function RedirectToSignupFlow ({ currentUser, pathname }) {
  if (!currentUser || !currentUser.settings || !currentUser.settings.signupInProgress) return null
  if (isSignupPath(pathname)) return null
  const destination = '/signup/upload-photo'
  return <Redirect to={destination} />
}

export function RedirectToCommunity ({ path, currentUser }) {
  return <Route path={path} exact render={redirectIfCommunity(currentUser)} />
}

export function redirectIfCommunity (currentUser, holochain = HOLOCHAIN_ACTIVE) {
  return () => {
    if (holochain) return <Redirect to={defaultHolochainCommunityUrl()} />

    if (currentUser.memberships.count() === 0) return <Redirect to={`/all`} />

    const mostRecentCommunity = currentUser.memberships
      .orderBy(m => new Date(m.lastViewedAt), 'desc')
      .first()
      .community

    return <Redirect to={`/c/${mostRecentCommunity.slug}`} />
  }
}
