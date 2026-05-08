import { Link } from 'next-view-transitions'
import { IconArrowBack, IconPoint } from '@tabler/icons-react'
import { formatDate } from '@/lib/format-date'
import GiscusComments from '@/components/giscus-comments'
import { CustomMetadata } from '@/app/[lang]/[[...mdxPath]]/page'
import { Posts } from '@/components/posts'
import type { Heading } from 'nextra'
import { TOC } from '@/components/toc'
import { ReactNode } from 'react'

type Props = {
  metadata: CustomMetadata
  toc: Heading[]
  lang: string
  children: ReactNode
}

export function PostDetail({ metadata, toc, lang, children }: Props) {
  const backLabel = lang === 'vi' ? 'Quay lại bài viết' : 'Back to posts'

  return (
    <>
      <div className="flex items-center gap-4 text-sm mb-6">
        <Link href="/posts" className="hover:underline no-underline flex items-center gap-1">
          <IconArrowBack className="w-4" />
          {backLabel}
        </Link>

        <IconPoint className="w-3" />

        <div>{formatDate(metadata.date, lang)}</div>

        {metadata.readingTime && (
          <>
            <IconPoint className="w-3" />
            <div>{metadata.readingTime.text}</div>
          </>
        )}
      </div>

      <div className="relative">
        {children}

        <div className="absolute right-full top-0 bottom-0 mr-8 hidden xl:block">
          <TOC toc={toc} />
        </div>
      </div>

      <h2>{lang === 'vi' ? 'Liên quan' : 'Related'}</h2>

      <Posts tags={metadata.tags} excludeByTitle={metadata.title as string} first={5} lang={lang} />

      {metadata.enableComment === true && (
        <div className="pt-32">
          <GiscusComments lang={lang} />
        </div>
      )}
    </>
  )
}
