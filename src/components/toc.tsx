'use client'

import type { Heading } from 'nextra'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'react-use'
import { AlignRightIcon } from '@/components/animated-icons/align-right-icon'

export function TOC({ toc }: { toc: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const [collapsedStored, setCollapsed] = useLocalStorage<boolean>('toc-collapsed', false)
  const [mounted, setMounted] = useState(false)
  const collapsed = mounted ? (collapsedStored ?? false) : false

  useEffect(() => {
    setMounted(true)
  }, [])
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const headingElements = toc.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[]

    if (headingElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 }
    )

    for (const el of headingElements) {
      observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  return (
    <div className="sticky top-20 flex items-start gap-2">
      <div
        className="grid transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateColumns: collapsed ? '0fr' : '18rem' }}
      >
        <div className="overflow-hidden">
          <nav
            className={`w-72 transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100 delay-150'}`}
            aria-hidden={collapsed}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
            <ul className="list-none pl-0 space-y-1 text-sm">
              {toc.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
                      setActiveId(heading.id)
                    }}
                    tabIndex={collapsed ? -1 : 0}
                    className={`block py-1 border-l-2 transition-colors ${
                      heading.depth === 3 ? 'pl-8' : heading.depth >= 4 ? 'pl-12' : 'pl-3'
                    } ${
                      activeId === heading.id
                        ? 'border-foreground text-foreground font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {heading.value}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <AlignRightIcon size={24} />
      </button>
    </div>
  )
}
