import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['en', 'vi']
const DEFAULT_LOCALE = 'en'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (/\.\w+$/.test(pathname) || pathname.startsWith('/tools')) {
    return NextResponse.next()
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  const locale = request.cookies.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE
  const validLocale = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE

  request.nextUrl.pathname = `/${validLocale}${pathname}`
  return NextResponse.rewrite(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest|_pagefind).*)',
  ],
}
