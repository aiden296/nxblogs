'use client'

import { QueuesPanel as SharedQueuesPanel } from '@/components/event-loop-shared'
import type { QueueDef, ExtraSection } from '@/components/event-loop-shared'
import { QUEUE_COLORS, QUEUE_DOT_COLORS } from './constants'

const QUEUE_DEFS: QueueDef[] = [
  { id: 'task', label: 'Task Queue', dotColor: QUEUE_DOT_COLORS.task, colorClass: QUEUE_COLORS.task },
  { id: 'microtask', label: 'Microtask Queue', dotColor: QUEUE_DOT_COLORS.microtask, colorClass: QUEUE_COLORS.microtask },
  { id: 'raf', label: 'rAF Queue', dotColor: QUEUE_DOT_COLORS.raf, colorClass: QUEUE_COLORS.raf },
]

export function QueuesPanel({
  queues,
  webAPIs,
}: {
  queues: Partial<Record<string, string[]>>
  webAPIs: string[]
}) {
  const extra: ExtraSection = {
    label: 'Web APIs',
    dotColor: '#f97316',
    items: webAPIs,
    emptyText: 'idle',
    itemColorClass: 'border-orange-800 text-orange-300',
    position: 'before',
  }

  return (
    <SharedQueuesPanel
      title="Task Queues"
      queues={queues}
      queueDefs={QUEUE_DEFS}
      extraSection={extra}
    />
  )
}
