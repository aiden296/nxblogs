'use client'

import React from 'react'
import Giscus from '@giscus/react'

const GiscusComments = () => {
  return (
    <Giscus
      id="comments"
      repo="aiden296/nxblogs"
      repoId="R_kgDOQ26JqQ"
      category="Announcements"
      categoryId="DIC_kwDOQ26Jqc4C0yiy"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="vi"
      loading="lazy"
    />
  )
}

export default GiscusComments
