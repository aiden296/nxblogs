import * as React from 'react'
import { Link } from 'next-view-transitions'
import { IconArrowBack, IconPoint } from '@tabler/icons-react'
import { formatDate } from '@/lib/format-date'
import GiscusComments from '@/components/giscus-comments'
import { CustomMetadata } from '@/app/[[...mdxPath]]/page'
import { Posts } from '@/components/posts'
import type { Heading } from 'nextra'
import { TOC } from '@/components/toc'

type Props = {
  metadata: CustomMetadata
  toc: Heading[]
  children: React.ReactNode
}

export function PostDetail({ metadata, toc, children }: Props) {
  return (
    <>
      <div className="flex items-center gap-4 text-sm mb-6">
        <Link href="/posts" className="hover:underline no-underline flex items-center gap-1">
          <IconArrowBack className="w-4" />
          Back to Posts
        </Link>
        <IconPoint className="w-3" />
        <div>{formatDate(metadata.date)}</div>
      </div>

      <div className="relative">
        {children}
        <div className="absolute right-full top-0 bottom-0 mr-8 hidden xl:block">
          <TOC toc={toc} />
        </div>
      </div>

      <h2>Related</h2>
      <Posts tags={metadata.tags} excludeByTitle={metadata.title as string} first={5} />

      {metadata.enableComment === true && (
        <div className="pt-32">
          <GiscusComments />
        </div>
      )}
    </>
  )
}
