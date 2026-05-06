import { HashTablePanel } from '@/components/redis-sorted-set-simulator/hash-table-panel'
import { SkipListPanel } from '@/components/redis-sorted-set-simulator/skip-list-panel'
import type { SortedNode, Step } from '@/components/redis-sorted-set-simulator/types'

export function DualStructurePanel({
  nodes,
  allMembers,
  step,
}: {
  nodes: SortedNode[]
  allMembers: Map<string, number>
  step: Step | null
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <HashTablePanel members={allMembers} step={step} />
      <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>kết hợp với</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <SkipListPanel nodes={nodes} step={step} />
    </div>
  )
}
