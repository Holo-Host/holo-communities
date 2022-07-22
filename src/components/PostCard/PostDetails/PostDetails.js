import React from 'react'
import { pick } from 'lodash/fp'
import Highlight from 'components/Highlight'
import ClickCatcher from 'components/ClickCatcher'
import LinkPreview from '../LinkPreview'
import { textLength, truncate } from 'hylo-utils/text'
import './PostDetails.scss'

const maxDetailsLength = 144

export default function PostDetails ({
  details,
  linkPreview,
  expanded,
  highlightProps,
  hideDetails
}) {
  // TODO: Sanitize is faling due to a cheerio issue, investigate...
  // details = present(details, { slug })

  if (!expanded && textLength(details) > maxDetailsLength) {
    details = truncate(details, maxDetailsLength)
  }

  return <Highlight {...highlightProps}>
    <div styleName='postDetails'>
      {details && !hideDetails &&
        <ClickCatcher>
          <div styleName='details' dangerouslySetInnerHTML={{ __html: details }} />
        </ClickCatcher>
      }
      {linkPreview && <LinkPreview {...pick(['title', 'url', 'imageUrl'], linkPreview)} />}
    </div>
  </Highlight>
}
