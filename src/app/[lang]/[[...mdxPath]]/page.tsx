import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'
import type { Metadata } from 'next'
import type { ReadingTime } from 'nextra'
import { PostDetail } from '@/components/post-detail'

type PageParams = {
  lang: string
  mdxPath: string[]
}

type PageProps = {
  params: Promise<PageParams>
}

export type CustomMetadata = Metadata & {
  date?: string
  enableComment?: boolean
  tags?: string[]
  readingTime?: ReadingTime
}

export const generateStaticParams = generateStaticParamsFor('mdxPath', 'lang')

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath, params.lang)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props: PageProps) {
  const params = await props.params
  const result = await importPage(params.mdxPath, params.lang)

  const { default: MDXContent, toc, metadata } = result

  const isPostPage = params.mdxPath && params.mdxPath.length > 1 && params.mdxPath.includes('posts')

  return (
    // @ts-ignore
    <Wrapper toc={toc} metadata={metadata}>
      {isPostPage && (
        <PostDetail metadata={metadata} toc={toc} lang={params.lang}>
          <MDXContent {...props} params={params} />
        </PostDetail>
      )}

      {!isPostPage && (
        <>
          <MDXContent {...props} params={params} />
        </>
      )}
    </Wrapper>
  )
}
