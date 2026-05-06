'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

const INITIAL_DATA: [string, number][] = [
  ['alice', 1500],
  ['aiden', 2400],
  ['eve', 900],
]

const MAX_LEVEL = 4

type SortedNode = {
  member: string
  score: number
  height: number
}

type Step = {
  description: string
  detail?: string
  hashHighlight?: string
  hashAction?: 'lookup' | 'insert' | 'update' | 'delete'
  skipFocus?: string
  skipLevel?: number
  skipVisited?: string[]
  state?: SortedNode[]
  pending?: { member: string; score: number; height: number }
  removing?: string
  rankCounter?: number
}

type OpType = 'ZADD' | 'ZSCORE' | 'ZRANK' | 'ZRANGE' | 'ZREM'

const OPERATIONS: { id: OpType; label: string; description: string }[] = [
  { id: 'ZADD', label: 'ZADD', description: 'Thêm hoặc cập nhật score — cập nhật cả hash table và skip list' },
  { id: 'ZSCORE', label: 'ZSCORE', description: 'Lấy score qua hash table — O(1)' },
  { id: 'ZRANK', label: 'ZRANK', description: 'Đếm rank bằng cách traverse skip list, cộng dồn span' },
  { id: 'ZRANGE', label: 'ZRANGE', description: 'Tìm node bắt đầu rồi walk forward trên level 1' },
  { id: 'ZREM', label: 'ZREM', description: 'Xoá member khỏi cả hash table và skip list' },
]

function memberHeight(member: string): number {
  let h = 5381
  for (let i = 0; i < member.length; i++) h = ((h << 5) + h + member.charCodeAt(i)) | 0
  let rng = ((h >>> 0) % 10000) / 10000
  let height = 1
  while (rng < 0.5 && height < MAX_LEVEL) {
    rng *= 2
    height++
  }
  return height
}

function getSortedNodes(members: Map<string, number>): SortedNode[] {
  return Array.from(members.entries())
    .map(([member, score]) => ({ member, score, height: memberHeight(member) }))
    .sort((a, b) => a.score - b.score || a.member.localeCompare(b.member))
}

function bucketOf(member: string, bucketCount: number): number {
  let h = 0
  for (let i = 0; i < member.length; i++) h = (h * 31 + member.charCodeAt(i)) | 0
  return Math.abs(h) % bucketCount
}

function formatScore(s: number): string {
  return s % 1 === 0 ? s.toFixed(0) : String(s)
}

function traverseToTarget(sorted: SortedNode[], target: number, targetMember?: string): Step[] {
  const steps: Step[] = []
  let currentIdx = -1
  const visited: string[] = []

  for (let level = MAX_LEVEL; level >= 1; level--) {
    while (true) {
      let nextIdx = -1
      for (let i = currentIdx + 1; i < sorted.length; i++) {
        if (sorted[i].height >= level) {
          nextIdx = i
          break
        }
      }
      const fromName = currentIdx === -1 ? 'HEAD' : sorted[currentIdx].member
      if (nextIdx === -1) {
        steps.push({
          description: `Level ${level}: từ ${fromName} → NIL. Xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
        })
        break
      }
      const next = sorted[nextIdx]
      const isLess = next.score < target || (next.score === target && !!targetMember && next.member < targetMember)
      if (isLess) {
        steps.push({
          description: `Level ${level}: ${next.member} (score ${formatScore(next.score)}) < target ${formatScore(target)} — đi forward.`,
          skipFocus: next.member,
          skipLevel: level,
          skipVisited: [...visited, next.member],
          state: sorted,
        })
        currentIdx = nextIdx
        visited.push(next.member)
      } else {
        steps.push({
          description: `Level ${level}: ${next.member} (score ${formatScore(next.score)}) ≥ ${formatScore(target)} — dừng, xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
        })
        break
      }
    }
  }
  return steps
}

function genZADDSteps(member: string, score: number, members: Map<string, number>): Step[] {
  const steps: Step[] = []
  const exists = members.has(member)
  const sorted = getSortedNodes(members)

  steps.push({
    description: `1. Hash table lookup: kiểm tra "${member}" đã tồn tại chưa.`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  if (exists) {
    const oldScore = members.get(member)!
    steps.push({
      description: `Hash table trả về score cũ = ${formatScore(oldScore)}. Cần xoá node cũ trong skip list.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    })

    const findOld = traverseToTarget(sorted, oldScore, member)
    findOld.forEach((s) => steps.push({ ...s, description: `Tìm node "${member}" để xoá — ${s.description}` }))

    const tempMembers = new Map(members)
    tempMembers.delete(member)
    const tempSorted = getSortedNodes(tempMembers)
    steps.push({
      description: `Xoá node "${member}" khỏi mọi level của skip list.`,
      state: sorted,
      removing: member,
      skipFocus: member,
    })

    const findNew = traverseToTarget(tempSorted, score, member)
    findNew.forEach((s) =>
      steps.push({
        ...s,
        description: `Tìm vị trí mới cho score ${formatScore(score)} — ${s.description}`,
        pending: { member, score, height: memberHeight(member) },
      })
    )

    const finalMembers = new Map(tempMembers)
    finalMembers.set(member, score)
    const finalSorted = getSortedNodes(finalMembers)
    steps.push({
      description: `Insert node "${member}" với score mới ${formatScore(score)} vào skip list.`,
      state: finalSorted,
      skipFocus: member,
    })
    steps.push({
      description: `Cập nhật hash table: "${member}" → ${formatScore(score)}.`,
      hashHighlight: member,
      hashAction: 'update',
      state: finalSorted,
    })
  } else {
    const height = memberHeight(member)
    steps.push({
      description: `Hash table trả (nil) → đây là member mới. Tung đồng xu: chiều cao = ${height}.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    })

    const findPos = traverseToTarget(sorted, score, member)
    findPos.forEach((s) =>
      steps.push({
        ...s,
        description: `Tìm vị trí chèn — ${s.description}`,
        pending: { member, score, height },
      })
    )

    const finalMembers = new Map(members)
    finalMembers.set(member, score)
    const finalSorted = getSortedNodes(finalMembers)
    steps.push({
      description: `Insert node "${member}" với score ${formatScore(score)} vào skip list (cập nhật forward pointers).`,
      state: finalSorted,
      skipFocus: member,
    })
    steps.push({
      description: `Insert vào hash table: "${member}" → ${formatScore(score)}.`,
      hashHighlight: member,
      hashAction: 'insert',
      state: finalSorted,
    })
  }
  return steps
}

function genZSCORESteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  return [
    {
      description: `1. Hash member name "${member}" → tìm bucket trong hash table.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    },
    exists
      ? {
          description: `2. Bucket có entry → trả về score ${formatScore(members.get(member)!)}. Skip list không cần thiết — O(1).`,
          hashHighlight: member,
          hashAction: 'lookup',
          state: sorted,
        }
      : {
          description: `2. Bucket trống — trả (nil).`,
          state: sorted,
        },
  ]
}

function genZRANKSteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  if (!exists) {
    return [
      {
        description: `Hash table cho biết "${member}" không tồn tại → trả (nil).`,
        hashHighlight: member,
        hashAction: 'lookup',
        state: sorted,
      },
    ]
  }

  const target = members.get(member)!
  const steps: Step[] = []
  steps.push({
    description: `Hash table xác nhận "${member}" tồn tại. Bây giờ duyệt skip list để đếm rank (cộng dồn span).`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  const visited: string[] = []
  let currentIdx = -1
  let rank = 0

  for (let level = MAX_LEVEL; level >= 1; level--) {
    while (true) {
      let nextIdx = -1
      for (let i = currentIdx + 1; i < sorted.length; i++) {
        if (sorted[i].height >= level) {
          nextIdx = i
          break
        }
      }
      const fromName = currentIdx === -1 ? 'HEAD' : sorted[currentIdx].member
      if (nextIdx === -1) {
        steps.push({
          description: `Level ${level}: từ ${fromName} → NIL. Xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
          rankCounter: rank,
        })
        break
      }
      const next = sorted[nextIdx]
      const reachedTarget = next.score > target || (next.score === target && next.member >= member)
      if (reachedTarget) {
        steps.push({
          description: `Level ${level}: ${next.member} ≥ target — dừng, xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
          rankCounter: rank,
        })
        break
      }
      const span = nextIdx - currentIdx
      rank += span
      steps.push({
        description: `Level ${level}: nhảy đến ${next.member} (span ${span}). Rank cộng dồn = ${rank}.`,
        skipFocus: next.member,
        skipLevel: level,
        skipVisited: [...visited, next.member],
        state: sorted,
        rankCounter: rank,
      })
      currentIdx = nextIdx
      visited.push(next.member)
      if (next.member === member) break
    }
    if (currentIdx >= 0 && sorted[currentIdx].member === member) break
  }

  steps.push({
    description: `Tìm thấy "${member}". Trả về rank = ${rank} (0-based: phần tử trước "${member}" có ${rank} node).`,
    skipFocus: member,
    skipVisited: [...visited],
    state: sorted,
    rankCounter: rank,
  })
  return steps
}

function genZRANGESteps(start: number, stop: number, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const len = sorted.length
  const s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len)
  const e = stop < 0 ? len + stop : Math.min(stop, len - 1)

  const steps: Step[] = []
  if (s > e || len === 0) {
    return [
      {
        description: `Range rỗng (start ${start} → stop ${stop}). Trả (empty array).`,
        state: sorted,
      },
    ]
  }

  steps.push({
    description: `Skip list traversal: nhảy đến rank = ${s} (cộng dồn span trên các level).`,
    skipFocus: 'HEAD',
    skipLevel: MAX_LEVEL,
    skipVisited: [],
    state: sorted,
  })

  const visited: string[] = []
  for (let i = 0; i <= s; i++) {
    if (i < sorted.length) {
      visited.push(sorted[i].member)
      steps.push({
        description: `Đến rank ${i}: "${sorted[i].member}" (score ${formatScore(sorted[i].score)}).`,
        skipFocus: sorted[i].member,
        skipLevel: 1,
        skipVisited: [...visited],
        state: sorted,
      })
      if (i === s) break
    }
  }

  steps.push({
    description: `Bắt đầu thu thập members. Walk forward trên level 1 cho đến rank ${e}.`,
    skipFocus: sorted[s].member,
    skipLevel: 1,
    skipVisited: [...visited],
    state: sorted,
  })

  for (let i = s + 1; i <= e; i++) {
    visited.push(sorted[i].member)
    steps.push({
      description: `Thu thập rank ${i}: "${sorted[i].member}".`,
      skipFocus: sorted[i].member,
      skipLevel: 1,
      skipVisited: [...visited],
      state: sorted,
    })
  }

  steps.push({
    description: `Hoàn tất. Trả về ${e - s + 1} members từ rank ${s} đến ${e}.`,
    skipVisited: [...visited],
    state: sorted,
  })
  return steps
}

function genZREMSteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  if (!exists) {
    return [
      {
        description: `Hash table lookup → "${member}" không tồn tại. Trả (integer) 0.`,
        hashHighlight: member,
        hashAction: 'lookup',
        state: sorted,
      },
    ]
  }

  const target = members.get(member)!
  const steps: Step[] = []
  steps.push({
    description: `1. Hash table lookup: tìm "${member}".`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  const find = traverseToTarget(sorted, target, member)
  find.forEach((s) => steps.push({ ...s, description: `Tìm node để xoá — ${s.description}` }))

  const next = new Map(members)
  next.delete(member)
  const finalSorted = getSortedNodes(next)

  steps.push({
    description: `Xoá node "${member}" khỏi tất cả forward pointers ở mọi level của skip list.`,
    state: sorted,
    removing: member,
    skipFocus: member,
  })

  steps.push({
    description: `Xoá entry khỏi hash table.`,
    hashHighlight: member,
    hashAction: 'delete',
    state: finalSorted,
  })

  return steps
}

export function RedisSortedSetSimulator() {
  const [members, setMembers] = useState(() => new Map(INITIAL_DATA))
  const [activeOp, setActiveOp] = useState<OpType>('ZADD')
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  const [zaddMember, setZaddMember] = useState('')
  const [zaddScore, setZaddScore] = useState('')
  const [zscoreMember, setZscoreMember] = useState('')
  const [zrankMember, setZrankMember] = useState('')
  const [zrangeStart, setZrangeStart] = useState('0')
  const [zrangeStop, setZrangeStop] = useState('-1')
  const [zremMember, setZremMember] = useState('')

  const sortedNodes = useMemo(() => getSortedNodes(members), [members])
  const currentStep: Step | null = steps[stepIdx] ?? null
  const displayedNodes = currentStep?.state ?? sortedNodes
  const displayedMembers = useMemo(() => {
    if (!currentStep?.state) return members
    return new Map(currentStep.state.map((n) => [n.member, n.score]))
  }, [currentStep, members])

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStepIdx((i) => i + 1), 1100)
    return () => clearTimeout(timer)
  }, [playing, stepIdx, steps.length])

  function runOp(generated: Step[], commit?: () => Map<string, number>) {
    setSteps(generated)
    setStepIdx(0)
    setPlaying(true)
    if (commit) {
      const next = commit()
      setTimeout(() => setMembers(next), generated.length * 1100 + 200)
    }
  }

  function handleZADD() {
    if (!zaddMember.trim() || !zaddScore.trim()) return
    const score = parseFloat(zaddScore)
    if (isNaN(score) || !isFinite(score)) return
    const member = zaddMember.trim()
    runOp(genZADDSteps(member, score, members), () => {
      const next = new Map(members)
      next.set(member, score)
      return next
    })
    setZaddMember('')
    setZaddScore('')
  }

  function handleZSCORE() {
    if (!zscoreMember) return
    runOp(genZSCORESteps(zscoreMember, members))
  }

  function handleZRANK() {
    if (!zrankMember) return
    runOp(genZRANKSteps(zrankMember, members))
  }

  function handleZRANGE() {
    const start = parseInt(zrangeStart, 10)
    const stop = parseInt(zrangeStop, 10)
    if (isNaN(start) || isNaN(stop)) return
    runOp(genZRANGESteps(start, stop, members))
  }

  function handleZREM() {
    if (!zremMember) return
    const exists = members.has(zremMember)
    runOp(
      genZREMSteps(zremMember, members),
      exists
        ? () => {
            const next = new Map(members)
            next.delete(zremMember)
            return next
          }
        : undefined
    )
    setZremMember('')
  }

  function handleReset() {
    setMembers(new Map(INITIAL_DATA))
    setSteps([])
    setStepIdx(0)
    setPlaying(false)
  }

  return (
    <div className="not-prose my-8 space-y-4">
      <div className="rounded-lg border border-border bg-card text-card-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-1 pl-2">
          <div className="flex flex-wrap gap-1">
            {OPERATIONS.map((op) => (
              <button
                key={op.id}
                onClick={() => setActiveOp(op.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 font-mono text-xs transition',
                  activeOp === op.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {op.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="mr-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3 text-xs text-muted-foreground">{OPERATIONS.find((o) => o.id === activeOp)?.description}</p>

          {activeOp === 'ZADD' && (
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Member" className="min-w-[140px] flex-1">
                <input
                  value={zaddMember}
                  onChange={(e) => setZaddMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleZADD()}
                  placeholder="frank"
                  className={inputClass}
                />
              </Field>
              <Field label="Score" className="w-28">
                <input
                  inputMode="decimal"
                  value={zaddScore}
                  onChange={(e) => setZaddScore(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleZADD()}
                  placeholder="3000"
                  className={inputClass}
                />
              </Field>
              <button onClick={handleZADD} className={runButtonClass}>
                Run ZADD
              </button>
            </div>
          )}

          {activeOp === 'ZSCORE' && (
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Member" className="min-w-[140px] flex-1">
                <select value={zscoreMember} onChange={(e) => setZscoreMember(e.target.value)} className={inputClass}>
                  <option value="">— Chọn member —</option>
                  {sortedNodes.map((n) => (
                    <option key={n.member} value={n.member}>
                      {n.member}
                    </option>
                  ))}
                </select>
              </Field>
              <button onClick={handleZSCORE} className={runButtonClass} disabled={!zscoreMember}>
                Run ZSCORE
              </button>
            </div>
          )}

          {activeOp === 'ZRANK' && (
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Member" className="min-w-[140px] flex-1">
                <select value={zrankMember} onChange={(e) => setZrankMember(e.target.value)} className={inputClass}>
                  <option value="">— Chọn member —</option>
                  {sortedNodes.map((n) => (
                    <option key={n.member} value={n.member}>
                      {n.member}
                    </option>
                  ))}
                </select>
              </Field>
              <button onClick={handleZRANK} className={runButtonClass} disabled={!zrankMember}>
                Run ZRANK
              </button>
            </div>
          )}

          {activeOp === 'ZRANGE' && (
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Start" className="w-20">
                <input
                  inputMode="numeric"
                  value={zrangeStart}
                  onChange={(e) => setZrangeStart(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Stop" className="w-20">
                <input
                  inputMode="numeric"
                  value={zrangeStop}
                  onChange={(e) => setZrangeStop(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <button onClick={handleZRANGE} className={runButtonClass}>
                Run ZRANGE
              </button>
              <p className="w-full text-xs text-muted-foreground">
                Index âm: <code className="font-mono">-1</code> = phần tử cuối, <code className="font-mono">0 -1</code>{' '}
                = lấy tất cả.
              </p>
            </div>
          )}

          {activeOp === 'ZREM' && (
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Member" className="min-w-[140px] flex-1">
                <select value={zremMember} onChange={(e) => setZremMember(e.target.value)} className={inputClass}>
                  <option value="">— Chọn member —</option>
                  {sortedNodes.map((n) => (
                    <option key={n.member} value={n.member}>
                      {n.member}
                    </option>
                  ))}
                </select>
              </Field>
              <button onClick={handleZREM} className={runButtonClass} disabled={!zremMember}>
                Run ZREM
              </button>
            </div>
          )}
        </div>
      </div>

      <StepControls
        step={currentStep}
        stepIdx={stepIdx}
        totalSteps={steps.length}
        playing={playing}
        onPrev={() => {
          setPlaying(false)
          setStepIdx((i) => Math.max(0, i - 1))
        }}
        onNext={() => {
          setPlaying(false)
          setStepIdx((i) => Math.min(steps.length - 1, i + 1))
        }}
        onPlay={() => setPlaying((p) => !p)}
      />

      <DualStructurePanel nodes={displayedNodes} allMembers={displayedMembers} step={currentStep} />
    </div>
  )
}

function DualStructurePanel({
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

function HashTablePanel({ members, step }: { members: Map<string, number>; step: Step | null }) {
  const BUCKETS = 8
  const buckets: { member: string; score: number }[][] = Array.from({ length: BUCKETS }, () => [])
  Array.from(members.entries()).forEach(([member, score]) => {
    const idx = bucketOf(member, BUCKETS)
    buckets[idx].push({ member, score })
  })

  const highlightMember = step?.hashHighlight
  const highlightBucket = highlightMember ? bucketOf(highlightMember, BUCKETS) : -1
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

type DisplayNode = {
  kind: 'head' | 'node' | 'pending' | 'nil'
  member: string
  score?: number
  height: number
}

function SkipListPanel({ nodes, step }: { nodes: SortedNode[]; step: Step | null }) {
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

  function gapHasArrow(gapIdx: number, level: number): boolean {
    let before = false
    let after = false
    for (let j = 0; j <= gapIdx; j++) if (allNodes[j].height >= level) before = true
    for (let j = gapIdx + 1; j < allNodes.length; j++) if (allNodes[j].height >= level) after = true
    return before && after
  }

  function gapIsActiveArrow(gapIdx: number, level: number): boolean {
    if (!focus || activeLevel !== level) return false
    const focusIdx = allNodes.findIndex((n) => n.member === focus)
    if (focusIdx < 0) return false
    if (allNodes[focusIdx].height < level) return false
    let nextIdx = -1
    for (let j = focusIdx + 1; j < allNodes.length; j++) {
      if (allNodes[j].height >= level) {
        nextIdx = j
        break
      }
    }
    if (nextIdx < 0) return false
    return gapIdx >= focusIdx && gapIdx < nextIdx
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
        <div className="flex min-w-fit items-stretch">
          {/* Level labels column */}
          <div className="mr-1 flex flex-col justify-start pt-1">
            {levels.map((level) => (
              <div
                key={level}
                className="flex h-8 w-6 items-center justify-end pr-1 font-mono text-[10px] text-muted-foreground"
              >
                L{level}
              </div>
            ))}
            <div className="h-6" />
            <div className="h-4" />
          </div>

          {allNodes.map((node, i) => (
            <div key={`${node.kind}-${node.member}-${i}`} className="flex">
              <NodeBlock
                node={node}
                levels={levels}
                isFocused={focus === node.member}
                activeLevel={activeLevel}
                isVisited={visited.has(node.member)}
                isRemoving={removing === node.member}
              />
              {i < allNodes.length - 1 && (
                <ArrowGap
                  levels={levels}
                  hasArrow={(level) => gapHasArrow(i, level)}
                  isActive={(level) => gapIsActiveArrow(i, level)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NodeBlock({
  node,
  levels,
  isFocused,
  activeLevel,
  isVisited,
  isRemoving,
}: {
  node: DisplayNode
  levels: number[]
  isFocused: boolean
  activeLevel?: number
  isVisited: boolean
  isRemoving: boolean
}) {
  const isHead = node.kind === 'head'
  const isNil = node.kind === 'nil'
  const isPending = node.kind === 'pending'
  const isSentinel = isHead || isNil

  return (
    <div
      className={cn(
        'flex w-20 flex-col overflow-hidden rounded-md border-2 transition-all duration-300',
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
      <div className="flex flex-col pt-1">
        {levels.map((level) => {
          const hasLevel = node.height >= level
          const isActive = isFocused && activeLevel === level
          return (
            <div
              key={level}
              className={cn('flex h-8 items-center justify-center transition-colors', isActive && 'bg-blue-500/20')}
            >
              {hasLevel ? (
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
              ) : null}
            </div>
          )
        })}
      </div>
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
        {!isSentinel && node.score !== undefined ? formatScore(node.score) : ' '}
      </div>
    </div>
  )
}

function ArrowGap({
  levels,
  hasArrow,
  isActive,
}: {
  levels: number[]
  hasArrow: (level: number) => boolean
  isActive: (level: number) => boolean
}) {
  return (
    <div className="flex w-6 flex-col pt-1">
      {levels.map((level) => {
        const has = hasArrow(level)
        const active = has && isActive(level)
        return (
          <div key={level} className="relative flex h-8 items-center justify-center">
            {has && (
              <>
                <div className={cn('h-0.5 w-full transition-colors', active ? 'bg-blue-500' : 'bg-foreground/25')} />
                <span
                  className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 text-[10px] leading-none transition-colors',
                    active ? 'text-blue-500' : 'text-foreground/40'
                  )}
                >
                  ▶
                </span>
              </>
            )}
          </div>
        )
      })}
      <div className="h-6" />
      <div className="h-4" />
    </div>
  )
}

function StepControls({
  step,
  stepIdx,
  totalSteps,
  playing,
  onPrev,
  onNext,
  onPlay,
}: {
  step: Step | null
  stepIdx: number
  totalSteps: number
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onPlay: () => void
}) {
  if (totalSteps === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
        Chọn một operation phía dưới và nhấn Run để xem các bước thực thi.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onPrev}
            disabled={stepIdx === 0}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-30"
          >
            ← Prev
          </button>
          <button
            onClick={onPlay}
            disabled={totalSteps === 0 || stepIdx >= totalSteps - 1}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-30"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={onNext}
            disabled={stepIdx >= totalSteps - 1}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
        <div className="min-w-0 flex-1">
          {totalSteps > 0 && (
            <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">
                Step {stepIdx + 1} / {totalSteps}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
          {step && <p className="text-sm leading-snug">{step.description}</p>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'

const runButtonClass =
  'rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
