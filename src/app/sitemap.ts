import type { MetadataRoute } from 'next'
import { Folder, MdxFile, Meta, MetaJsonFile, PageMapItem } from 'nextra'
import { getPageMap } from 'nextra/page-map'

export const dynamic = 'force-static'

const LOCALES = ['en', 'vi']

interface SitemapEntry {
  url: string
  lastModified: string
}

const isMetaJsonFile = (value: unknown): value is MetaJsonFile =>
  typeof value === 'object' && value !== null && 'data' in value

const isFolder = (value: unknown): value is Folder =>
  typeof value === 'object' && value !== null && 'name' in value && 'route' in value && 'children' in value

const isMdxFile = (value: unknown): value is MdxFile =>
  typeof value === 'object' && value !== null && 'name' in value && 'route' in value && 'frontMatter' in value

const isPageHidden = (name: string, metaData: Record<string, Meta>): boolean => {
  const metaEntry = metaData[name]

  if (typeof metaEntry === 'object' && metaEntry !== null && 'display' in metaEntry) {
    return metaEntry.display === 'hidden'
  }

  const wildcardEntry = metaData['*']
  if (typeof wildcardEntry === 'object' && wildcardEntry !== null && 'display' in wildcardEntry) {
    return wildcardEntry.display === 'hidden'
  }

  return false
}

const toSitemapEntry = (pageMapEntry: PageMapItem, metaData: Record<string, Meta> = {}): SitemapEntry[] => {
  if (isFolder(pageMapEntry)) {
    if (isPageHidden(pageMapEntry.name, metaData)) {
      return []
    }
    return parsePageMapItems(pageMapEntry.children)
  } else if (isMdxFile(pageMapEntry)) {
    if (isPageHidden(pageMapEntry.name, metaData)) {
      return []
    }

    const { frontMatter, route } = pageMapEntry

    return [
      {
        url: route,
        lastModified: frontMatter?.timestamp ? new Date(frontMatter.timestamp).toISOString() : new Date().toISOString(),
      },
    ]
  }

  return []
}

const parsePageMapItems = (items: PageMapItem[]): SitemapEntry[] => {
  const metaFile = items.find((item) => isMetaJsonFile(item))
  const metaData = (metaFile as MetaJsonFile | undefined)?.data ?? {}

  const sitemapEntries: SitemapEntry[] = items
    .filter((item) => !isMetaJsonFile(item))
    .flatMap((pageMapEntry) => toSitemapEntry(pageMapEntry, metaData))

  return sitemapEntries
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stopjustcoding.com'
  const defaultLocale = 'en'

  const routeTimestamps = new Map<string, string>()

  for (const locale of LOCALES) {
    try {
      const pageMap = await getPageMap(`/${locale}`)
      const entries = parsePageMapItems(pageMap)
      for (const entry of entries) {
        const existing = routeTimestamps.get(entry.url)
        if (!existing || entry.lastModified > existing) {
          routeTimestamps.set(entry.url, entry.lastModified)
        }
      }
    } catch {
      // locale has no content yet
    }
  }

  return Array.from(routeTimestamps.entries()).map(([route, lastModified]) => ({
    url: `${baseUrl}/${defaultLocale}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((locale) => [locale, `${baseUrl}/${locale}${route}`])),
    },
  }))
}
