import 'nextra-theme-blog/style.css'
import '@/styles/globals.css'

import CustomFooter from '@/components/custom-footer'
import CustomHeader from '@/components/custom-header'
import { BackToTop } from '@/components/back-to-top'
import { LocaleSync } from '@/components/locale-sync'
import { Metadata } from 'next'
import { Layout } from 'nextra-theme-blog'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Nextra Blog',
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
      <body className="min-h-screen">
        <Layout>
          <CustomHeader lang={lang} />

          {children}

          <CustomFooter lang={lang} />
        </Layout>
        <BackToTop />
        <LocaleSync />
      </body>
    </html>
  )
}
