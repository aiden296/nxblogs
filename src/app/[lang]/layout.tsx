import { Head } from 'nextra/components'
import 'nextra-theme-blog/style.css'
import '@/styles/globals.css'
import CustomFooter from '@/components/custom-footer'
import CustomHeader from '@/components/custom-header'
import { Analytics } from '@/components/analytics'
import { BackToTop } from '@/components/back-to-top'
import { LocaleSync } from '@/components/locale-sync'
import { Metadata } from 'next'
import { Layout } from 'nextra-theme-blog'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL('https://stopjustcoding.com'),
  title: {
    default: 'Stop Just Coding',
    template: '%s | Stop Just Coding',
  },
  description: 'Technical blog covering AWS, DevOps, cloud architecture, and software engineering.',
  openGraph: {
    type: 'website',
    siteName: 'Stop Just Coding',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const bodyFont = Inter({
  subsets: ['latin', 'vietnamese'],
})

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params
  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning className={bodyFont.className}>
      <Head backgroundColor={{ dark: '#1a1a1a', light: '#ffffff' }} />
      <body className="min-h-screen">
        <Layout>
          <CustomHeader lang={lang} />

          {children}

          <CustomFooter lang={lang} />
        </Layout>
        <BackToTop />
        <LocaleSync />
        <Analytics />
      </body>
    </html>
  )
}
