'use client'

export function CallStackPanel({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col-reverse gap-1 h-32 overflow-hidden">
      {items.length === 0 ? (
        <div className="text-xs text-slate-600 italic text-center py-4">empty</div>
      ) : (
        items.map((item, i) => {
          const isTop = i === items.length - 1
          return (
            <div
              key={`${item}-${i}`}
              className={`font-mono text-xs px-3 py-1.5 rounded border animate-[stackPush_0.25s_ease-out] ${
                isTop
                  ? 'bg-blue-950 border-blue-700 text-blue-300 animate-[pulse-ring_1.5s_infinite]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {item}
            </div>
          )
        })
      )}
    </div>
  )
}
