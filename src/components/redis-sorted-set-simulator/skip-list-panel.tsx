import { cn } from '@/lib/utils'
import { MAX_LEVEL } from '@/components/redis-sorted-set-simulator/constants'
import type { DisplayNode, SortedNode, Step } from '@/components/redis-sorted-set-simulator/types'
import { formatScore } from '@/components/redis-sorted-set-simulator/utils'

const LEVEL_ROW_H = 'h-8'

export function SkipListPanel({ nodes, step }: { nodes: SortedNode[]; step: Step | null }) {
  const focus = step?.skipFocus
  const visited = new Set(step?.skipVisited ?? [])
  const removing = step?.removing
  const pending = step?.pending
  const activeLevel = step?.skipLevel

  const allNodes: DisplayNode[] = [
    { kind: 'head', member: 'HEAD', height: MAX_LEVEL },
    ...nodes.map((n) => ({
      kind: 'node' as const,
      member: n.member,
      score: n.score,
      height: n.height,
    })),
    ...(pending
      ? [
          {
            kind: 'pending' as const,
            member: pending.member,
            score: pending.score,
            height: pending.height,
          },
        ]
      : []),
    { kind: 'nil', member: 'NIL', height: MAX_LEVEL },
  ]

  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => MAX_LEVEL - i)

  const focusIdx = focus ? allNodes.findIndex((n) => n.member === focus) : -1

  function nextNodeAtLevel(fromIdx: number, level: number): number {
    for (let j = fromIdx + 1; j < allNodes.length; j++) {
      if (allNodes[j].height >= level) return j
    }
    return -1
  }

  function activeRangeAtLevel(level: number): [number, number] | null {
    if (focusIdx < 0 || activeLevel !== level) return null
    if (allNodes[focusIdx].height < level) return null
    const nextIdx = nextNodeAtLevel(focusIdx, level)
    if (nextIdx < 0) return null
    return [focusIdx, nextIdx]
  }

  function gapHasLine(gapIdx: number, level: number): boolean {
    let before = false
    let after = false
    for (let j = 0; j <= gapIdx; j++) if (allNodes[j].height >= level) before = true
    for (let j = gapIdx + 1; j < allNodes.length; j++) if (allNodes[j].height >= level) after = true
    return before && after
  }

  function gapHasArrowhead(gapIdx: number, level: number): boolean {
    return gapHasLine(gapIdx, level) && allNodes[gapIdx + 1].height >= level
  }

  function gapIsActive(gapIdx: number, level: number): boolean {
    const range = activeRangeAtLevel(level)
    if (!range) return false
    const [from, to] = range
    return gapIdx >= from && gapIdx < to
  }

  function nodePassesLine(nodeIdx: number, level: number): boolean {
    if (allNodes[nodeIdx].height >= level) return false
    let before = false
    let after = false
    for (let j = 0; j < nodeIdx; j++) if (allNodes[j].height >= level) before = true
    for (let j = nodeIdx + 1; j < allNodes.length; j++) if (allNodes[j].height >= level) after = true
    return before && after
  }

  function nodePassThroughIsActive(nodeIdx: number, level: number): boolean {
    const range = activeRangeAtLevel(level)
    if (!range) return false
    const [from, to] = range
    return nodeIdx > from && nodeIdx < to
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Skip List</span>
        {step?.rankCounter !== undefined && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-xs text-blue-700 dark:text-blue-300">
            rank counter: {step.rankCounter}
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-fit items-stretch pt-1">
          <LevelLabelsColumn levels={levels} />

          {allNodes.map((node, i) => (
            <div key={`${node.kind}-${node.member}-${i}`} className="flex">
              <NodeColumn
                node={node}
                levels={levels}
                isFocused={focus === node.member}
                activeLevel={activeLevel}
                isVisited={visited.has(node.member)}
                isRemoving={removing === node.member}
                passesLine={(level) => nodePassesLine(i, level)}
                passActive={(level) => nodePassThroughIsActive(i, level)}
              />
              {i < allNodes.length - 1 && (
                <ArrowGap
                  levels={levels}
                  hasLine={(level) => gapHasLine(i, level)}
                  hasArrowhead={(level) => gapHasArrowhead(i, level)}
                  isActive={(level) => gapIsActive(i, level)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LevelLabelsColumn({ levels }: { levels: number[] }) {
  return (
    <div className="mr-1 flex flex-col">
      {levels.map((level) => (
        <div
          key={level}
          className={cn(
            'flex w-6 items-center justify-end pr-1 font-mono text-[10px] text-muted-foreground',
            LEVEL_ROW_H
          )}
        >
          L{level}
        </div>
      ))}
      <div className="h-6" />
      <div className="h-4" />
    </div>
  )
}

function NodeColumn({
  node,
  levels,
  isFocused,
  activeLevel,
  isVisited,
  isRemoving,
  passesLine,
  passActive,
}: {
  node: DisplayNode
  levels: number[]
  isFocused: boolean
  activeLevel?: number
  isVisited: boolean
  isRemoving: boolean
  passesLine: (level: number) => boolean
  passActive: (level: number) => boolean
}) {
  const isHead = node.kind === 'head'
  const isNil = node.kind === 'nil'
  const isPending = node.kind === 'pending'
  const isSentinel = isHead || isNil
  const totalLevels = levels.length
  const emptyTopLevels = Array.from({ length: totalLevels - node.height }, (_, i) => totalLevels - i)
  const ownLevels = Array.from({ length: node.height }, (_, i) => node.height - i)

  return (
    <div className="flex w-20 flex-col">
      {emptyTopLevels.map((level) => {
        const has = passesLine(level)
        const active = has && passActive(level)
        return (
          <div key={`pass-${level}`} className={cn('relative flex items-center justify-center', LEVEL_ROW_H)}>
            {has && (
              <div className={cn('h-0.5 w-full transition-colors', active ? 'bg-blue-500' : 'bg-foreground/25')} />
            )}
          </div>
        )
      })}

      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-md border-2 transition-all duration-300',
          isPending
            ? 'border-dashed border-amber-500 bg-amber-500/10'
            : isRemoving
              ? 'border-red-500 bg-red-500/10 opacity-60'
              : isFocused
                ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                : isVisited && !isSentinel
                  ? 'border-blue-400/50 bg-blue-500/5'
                  : isSentinel
                    ? 'border-dashed border-border bg-muted/40'
                    : 'border-border bg-card'
        )}
      >
        {ownLevels.map((level) => {
          const isActive = isFocused && activeLevel === level
          return (
            <div
              key={level}
              className={cn(
                'flex items-center justify-center transition-colors',
                LEVEL_ROW_H,
                isActive && 'bg-blue-500/20'
              )}
            >
              <span
                className={cn(
                  'inline-block h-2.5 w-2.5 rounded-full transition',
                  isActive
                    ? 'bg-blue-600 ring-2 ring-blue-500/40'
                    : isPending
                      ? 'bg-amber-600'
                      : isRemoving
                        ? 'bg-red-500'
                        : isSentinel
                          ? 'bg-muted-foreground'
                          : 'bg-foreground'
                )}
              />
            </div>
          )
        })}

        <div
          className={cn(
            'border-t px-2 pt-1 pb-0.5 text-center font-mono text-xs',
            isPending ? 'border-amber-500/50 text-amber-700 dark:text-amber-300' : 'border-border',
            isRemoving && 'line-through',
            isSentinel && 'text-muted-foreground'
          )}
        >
          {isPending ? `+${node.member}` : node.member}
        </div>
        <div className="px-1 pb-1 text-center font-mono text-[10px] tabular-nums text-muted-foreground">
          {!isSentinel && node.score !== undefined ? formatScore(node.score) : ' '}
        </div>
      </div>
    </div>
  )
}

function ArrowGap({
  levels,
  hasLine,
  hasArrowhead,
  isActive,
}: {
  levels: number[]
  hasLine: (level: number) => boolean
  hasArrowhead: (level: number) => boolean
  isActive: (level: number) => boolean
}) {
  return (
    <div className="flex w-6 flex-col">
      {levels.map((level) => {
        const has = hasLine(level)
        const arrowhead = hasArrowhead(level)
        const active = has && isActive(level)
        return (
          <div key={level} className={cn('relative flex items-center justify-center', LEVEL_ROW_H)}>
            {has && (
              <div className={cn('h-0.5 w-full transition-colors', active ? 'bg-blue-500' : 'bg-foreground/25')} />
            )}
            {arrowhead && (
              <span
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 text-[10px] leading-none transition-colors',
                  active ? 'text-blue-500' : 'text-foreground/40'
                )}
              >
                ▶
              </span>
            )}
          </div>
        )
      })}
      <div className="h-6" />
      <div className="h-4" />
    </div>
  )
}
