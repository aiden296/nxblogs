import { useMDXComponents as getBlogMDXComponents } from 'nextra-theme-blog'
import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { Posts } from '@/components/posts'
import { Tags } from '@/components/tags'
import { Avatar } from '@/components/avatar'
import { RedisSortedSetSimulator } from '@/components/redis-sorted-set-simulator'
import { ExcalidrawDiagram } from '@/components/excalidraw-diagram'
import { BrowserEventLoopVisualizer } from '@/components/browser-event-loop-visualizer'

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
    Posts: Posts,
    Tags: Tags,
    Avatar: Avatar,
    RedisSortedSetSimulator: RedisSortedSetSimulator,
    ExcalidrawDiagram: ExcalidrawDiagram,
    BrowserEventLoopVisualizer: BrowserEventLoopVisualizer,
  }
}
