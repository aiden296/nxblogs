import type { ComponentProps } from 'react'
import { useMDXComponents as getBlogMDXComponents } from 'nextra-theme-blog'
import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { ImageZoom } from 'nextra/components'
import { Posts } from '@/components/posts'
import { Tags } from '@/components/tags'
import { Avatar } from '@/components/avatar'
import { RedisSortedSetSimulator } from '@/components/redis-sorted-set-simulator'
import { ExcalidrawDiagram } from '@/components/excalidraw-diagram'

function Figure({ alt, ...props }: ComponentProps<typeof ImageZoom>) {
  return (
    <span className="post-figure">
      <ImageZoom alt={alt} {...props} />
      {alt ? <span className="post-figcaption">{alt}</span> : null}
    </span>
  )
}

const blogComponents = getBlogMDXComponents({
  h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
  DateFormatter: ({ date }) =>
    `Last updated at ${date.toLocaleDateString('en', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
})

const defaultComponents = getNextraComponents({
  wrapper({ children }) {
    return <>{children}</>
  },
})

export function useMDXComponents() {
  return {
    ...blogComponents,
    ...defaultComponents,
    img: Figure,
    Posts: Posts,
    Tags: Tags,
    Avatar: Avatar,
    RedisSortedSetSimulator: RedisSortedSetSimulator,
    ExcalidrawDiagram: ExcalidrawDiagram,
  }
}
