'use client'

export type QueueDef = {
  id: string
  label: string
  dotColor: string
  colorClass: string
}

export type ExtraSection = {
  label: string
  dotColor: string
  items: string[]
  emptyText: string
  itemColorClass: string
  position: 'before' | 'after'
}

function QueueSection({
  label,
  dotColor,
  items,
  emptyText,
  itemColorClass,
  bordered,
}: {
  label: string
  dotColor: string
  items: string[]
  emptyText: string
  itemColorClass: string
  bordered?: boolean
}) {
  return (
    <div className={bordered ? 'mt-2 pt-3 border-t border-slate-800' : ''}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <div className="min-h-[32px] bg-slate-900 rounded-lg border border-slate-800 p-2 flex flex-col gap-1">
        {items.length === 0 ? (
          <span className="text-xs text-slate-600 italic">{emptyText}</span>
        ) : (
          items.map((item, i) => (
            <div
              key={`${item}-${i}`}
              className={`font-mono text-xs px-2 py-1 rounded border bg-slate-950 animate-[queuePush_0.3s_ease-out] ${itemColorClass}`}
            >
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function QueuesPanel({
  title,
  queues,
  queueDefs,
  extraSection,
}: {
  title: string
  queues: Partial<Record<string, string[]>>
  queueDefs: QueueDef[]
  extraSection?: ExtraSection
}) {
  const beforeExtra = extraSection?.position === 'before' ? extraSection : undefined
  const afterExtra = extraSection?.position === 'after' ? extraSection : undefined

  return (
    <>
      {beforeExtra && (
        <QueueSection
          label={beforeExtra.label}
          dotColor={beforeExtra.dotColor}
          items={beforeExtra.items}
          emptyText={beforeExtra.emptyText}
          itemColorClass={beforeExtra.itemColorClass}
        />
      )}

      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>

      {queueDefs.map((def) => {
        const items = queues[def.id] || []
        return (
          <QueueSection
            key={def.id}
            label={def.label}
            dotColor={def.dotColor}
            items={items}
            emptyText="empty"
            itemColorClass={def.colorClass}
          />
        )
      })}

      {afterExtra && (
        <QueueSection
          label={afterExtra.label}
          dotColor={afterExtra.dotColor}
          items={afterExtra.items}
          emptyText={afterExtra.emptyText}
          itemColorClass={afterExtra.itemColorClass}
          bordered
        />
      )}
    </>
  )
}
