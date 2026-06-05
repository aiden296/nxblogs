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
import { GeistSans } from 'geist/font/sans'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { cn } from '@/lib/utils'
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

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params
  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning className={GeistSans.className}>
      <Head backgroundColor={{ dark: '#1a1a1a', light: '#ffffff' }} />
      <body className="min-h-screen">
        <AnimatedGridPattern
          numSquares={50}
          maxOpacity={0.08}
          duration={3}
          strokeDasharray={5}
          className={cn(
            'fixed inset-0 z-0 h-full w-full',
            'stroke-neutral-400/15 text-neutral-400 dark:stroke-neutral-500/15 dark:text-neutral-500'
          )}
        />

        <div
          aria-hidden="true"
          className="reading-backdrop pointer-events-none fixed inset-y-0 left-1/2 z-1 w-350 max-w-full -translate-x-1/2"
        />

        <div className="relative z-10">
          <Layout>
            <CustomHeader lang={lang} />
            {children}
            <CustomFooter lang={lang} />
          </Layout>
        </div>

        <BackToTop />
        <LocaleSync />
        <Analytics />
      </body>
    </html>
  )
}
