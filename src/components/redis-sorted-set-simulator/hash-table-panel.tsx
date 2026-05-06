import { cn } from '@/lib/utils'
import { HASH_BUCKETS } from '@/components/redis-sorted-set-simulator/constants'
import type { Step } from '@/components/redis-sorted-set-simulator/types'
import { bucketOf, formatScore } from '@/components/redis-sorted-set-simulator/utils'

export function HashTablePanel({ members, step }: { members: Map<string, number>; step: Step | null }) {
  const buckets: { member: string; score: number }[][] = Array.from({ length: HASH_BUCKETS }, () => [])
  Array.from(members.entries()).forEach(([member, score]) => {
    const idx = bucketOf(member, HASH_BUCKETS)
    buckets[idx].push({ member, score })
  })

  const highlightMember = step?.hashHighlight
  const highlightBucket = highlightMember ? bucketOf(highlightMember, HASH_BUCKETS) : -1
  const action = step?.hashAction

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Hash Table</span>
        <span className="text-xs text-muted-foreground">{members.size} entries</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
        {buckets.map((bucket, i) => {
          const active = i === highlightBucket
          return (
            <div
              key={i}
              className={cn(
                'rounded-md border p-2 transition-colors duration-500',
                active
                  ? action === 'delete'
                    ? 'border-red-500/50 bg-red-500/10'
                    : action === 'insert' || action === 'update'
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-blue-500/50 bg-blue-500/10'
                  : 'border-border bg-background'
              )}
            >
              <div className="mb-1 font-mono text-[10px] text-muted-foreground">bucket #{i}</div>
              {bucket.length === 0 ? (
                <div className="text-[11px] italic text-muted-foreground/50">empty</div>
              ) : (
                bucket.map((e) => (
                  <div
                    key={e.member}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded px-1 py-0.5 font-mono',
                      active && e.member === highlightMember && 'bg-foreground/10 font-semibold'
                    )}
                  >
                    <span className="truncate">{e.member}</span>
                    <span className="tabular-nums text-muted-foreground">{formatScore(e.score)}</span>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
