'use client'

import { QUEUE_COLORS, QUEUE_DOT_COLORS } from './constants'

const QUEUE_DEFS = [
  { id: 'nexttick', label: 'nextTick Queue' },
  { id: 'promise', label: 'Promise Queue' },
  { id: 'timer', label: 'Timer Queue' },
  { id: 'poll', label: 'Poll Queue (I/O)' },
  { id: 'check', label: 'Check Queue' },
  { id: 'close', label: 'Close Queue' },
]

export function QueuesPanel({
  queues,
  threadPool,
}: {
  queues: Partial<Record<string, string[]>>
  threadPool: string[]
}) {
  return (
    <>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Queues</h3>

      {QUEUE_DEFS.map((def) => {
        const items = queues[def.id] || []
        return (
          <div key={def.id}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: QUEUE_DOT_COLORS[def.id] }} />
              <span className="text-xs font-semibold text-slate-400">{def.label}</span>
            </div>
            <div className="min-h-[32px] bg-slate-900 rounded-lg border border-slate-800 p-2 flex flex-col gap-1">
              {items.length === 0 ? (
                <span className="text-xs text-slate-600 italic">empty</span>
              ) : (
                items.map((item, i) => (
                  <div
                    key={`${item}-${i}`}
                    className={`font-mono text-xs px-2 py-1 rounded border bg-slate-950 animate-[queuePush_0.3s_ease-out] ${QUEUE_COLORS[def.id] || 'border-slate-700 text-slate-300'}`}
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}

      <div className="mt-2 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-xs font-semibold text-slate-400">Thread Pool (libuv)</span>
        </div>
        <div className="min-h-[32px] bg-slate-900 rounded-lg border border-slate-800 p-2 flex flex-col gap-1">
          {threadPool.length === 0 ? (
            <span className="text-xs text-slate-600 italic">idle</span>
          ) : (
            threadPool.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="font-mono text-xs px-2 py-1 rounded border border-orange-800 text-orange-300 bg-slate-950 animate-[queuePush_0.3s_ease-out]"
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
