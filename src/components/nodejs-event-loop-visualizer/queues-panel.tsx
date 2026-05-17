'use client'

import { QueuesPanel as SharedQueuesPanel } from '@/components/event-loop-shared'
import type { QueueDef, ExtraSection } from '@/components/event-loop-shared'
import { QUEUE_COLORS, QUEUE_DOT_COLORS } from './constants'

const QUEUE_DEFS: QueueDef[] = [
  { id: 'nexttick', label: 'nextTick Queue', dotColor: QUEUE_DOT_COLORS.nexttick, colorClass: QUEUE_COLORS.nexttick },
  { id: 'promise', label: 'Promise Queue', dotColor: QUEUE_DOT_COLORS.promise, colorClass: QUEUE_COLORS.promise },
  { id: 'timer', label: 'Timer Queue', dotColor: QUEUE_DOT_COLORS.timer, colorClass: QUEUE_COLORS.timer },
  { id: 'poll', label: 'Poll Queue (I/O)', dotColor: QUEUE_DOT_COLORS.poll, colorClass: QUEUE_COLORS.poll },
  { id: 'check', label: 'Check Queue', dotColor: QUEUE_DOT_COLORS.check, colorClass: QUEUE_COLORS.check },
  { id: 'close', label: 'Close Queue', dotColor: QUEUE_DOT_COLORS.close, colorClass: QUEUE_COLORS.close },
]

export function QueuesPanel({
  queues,
  threadPool,
}: {
  queues: Partial<Record<string, string[]>>
  threadPool: string[]
}) {
  const extra: ExtraSection = {
    label: 'Thread Pool (libuv)',
    dotColor: '#f97316',
    items: threadPool,
    emptyText: 'idle',
    itemColorClass: 'border-orange-800 text-orange-300',
    position: 'after',
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
