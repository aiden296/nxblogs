'use client'

import type { EventLoopPhase } from './types'

const PHASES: { id: EventLoopPhase; label: string; color: string; activeColor: string }[] = [
  { id: 'macrotask', label: '1. Macrotask', color: 'border-blue-500/20', activeColor: 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  { id: 'microtask', label: '2. Microtasks', color: 'border-purple-500/20', activeColor: 'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-300' },
  { id: 'raf', label: '3. requestAnimationFrame', color: 'border-green-500/20', activeColor: 'border-green-500 bg-green-500/15 text-green-700 dark:text-green-300' },
  { id: 'render', label: '4. Render', color: 'border-rose-500/20', activeColor: 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300' },
  { id: 'idle-callback', label: '5. Idle', color: 'border-gray-500/20', activeColor: 'border-gray-500 bg-gray-500/15 text-gray-700 dark:text-gray-300' },
]

export function EventLoopPhases({ currentPhase }: { currentPhase: EventLoopPhase }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">Event Loop</div>
      <div className="space-y-1.5">
        {PHASES.map((phase) => {
          const isActive = phase.id === currentPhase
          return (
            <div
              key={phase.id}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                isActive ? phase.activeColor : `${phase.color} text-muted-foreground/50`
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`size-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'scale-125 bg-current' : 'bg-muted-foreground/20'
                  }`}
                />
                {phase.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
