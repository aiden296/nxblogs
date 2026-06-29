'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'nextra-theme-blog'

type Props = {
  lang?: string
}

const GiscusComments = ({ lang = 'vi' }: Props) => {
  const { theme } = useTheme()

  return (
    <Giscus
      id="comments"
      repo="anhquang296/nxblogs"
      repoId="R_kgDOQ26JqQ"
      category="Announcements"
      categoryId="DIC_kwDOQ26Jqc4C0yiy"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'dark_tritanopia' : 'light_tritanopia'}
      lang={lang}
      loading="lazy"
    />
  )
}

export default GiscusComments
