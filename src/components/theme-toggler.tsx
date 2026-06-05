'use client'

import { useTheme } from 'next-themes'
import { useMounted } from 'nextra/hooks'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export function ThemeToggler() {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()
  const theme = mounted && resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <AnimatedThemeToggler
      aria-label="Toggle Dark Mode"
      theme={theme}
      onThemeChange={(next) => setTheme(next)}
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-500/15 active:scale-95 dark:hover:bg-gray-400/20 [&_svg]:size-5"
    />
  )
}
