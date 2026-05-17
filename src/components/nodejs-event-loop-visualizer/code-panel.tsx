'use client'

import type { CodeLine } from './types'

export function CodePanel({
  codeLines,
  highlightLines,
  executedLineIds,
}: {
  codeLines: CodeLine[]
  highlightLines: string[]
  executedLineIds: Set<string>
}) {
  const hasHighlights = highlightLines.length > 0

  return (
    <div className="font-mono text-xs leading-6 rounded-lg bg-slate-900 p-4 border border-slate-800">
      {codeLines.map((line, i) => {
        const num = String(i + 1).padStart(2, ' ')
        const isHighlight = highlightLines.includes(line.id)
        const isExecuted = executedLineIds.has(line.id)
        const isDimmed = hasHighlights && !isHighlight && !isExecuted

        let className = 'px-2 py-0 rounded transition-all duration-300'
        if (isHighlight) {
          className += ' bg-blue-500/15 border-l-[3px] border-l-blue-500'
        } else if (isExecuted) {
          className += ' opacity-50 border-l-[3px] border-l-green-500 bg-green-500/5'
        } else if (isDimmed) {
          className += ' opacity-30'
        }

        const escaped = line.text || ' '

        return (
          <div key={line.id} className={className}>
            <span className="text-slate-600 select-none mr-3">{num}</span>
            <span className="text-slate-300">{escaped}</span>
          </div>
        )
      })}
    </div>
  )
}
