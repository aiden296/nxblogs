'use client'

import type { StepBadge } from './types'

export function StepDescription({
  badge,
  title,
  desc,
}: {
  badge: StepBadge
  title: string
  desc: string
}) {
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: badge.color }}
        >
          {badge.text}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}
