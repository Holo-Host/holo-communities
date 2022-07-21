import React from 'react'
import { cameraSvg, loadingSvg } from 'util/assets'
import { bgImageStyle } from 'util/index'
import '../Signup.scss'

export default function UploadImage ({ avatarUrl, currentUser, updateSettingDirectly, loading }) {
  return null
}

export function uploadAvatar (currentUser, loading, avatarUrl) {
  let imageUrl = cameraSvg
  let styleName = 'upload-background-image'

  if (currentUser.avatarUrl) {
    imageUrl = currentUser.avatarUrl
    styleName = 'upload-background-image contain'
  }
  if (avatarUrl) {
    imageUrl = avatarUrl
    styleName = 'upload-background-image contain'
  }
  if (loading) {
    imageUrl = loadingSvg
    styleName = 'loading-background-image'
  }
  return <div styleName='image-upload-icon'>
    <div style={bgImageStyle(imageUrl)} styleName={styleName} />
  </div>
}
