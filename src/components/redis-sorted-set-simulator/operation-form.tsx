import { cn } from '@/lib/utils'
import { OPERATIONS, inputClass, runButtonClass } from '@/components/redis-sorted-set-simulator/constants'
import type { OpType, SortedNode } from '@/components/redis-sorted-set-simulator/types'

export type OperationFormProps = {
  activeOp: OpType
  onChangeOp: (op: OpType) => void
  onReset: () => void
  sortedNodes: SortedNode[]

  zaddMember: string
  zaddScore: string
  setZaddMember: (v: string) => void
  setZaddScore: (v: string) => void
  onZADD: () => void

  zscoreMember: string
  setZscoreMember: (v: string) => void
  onZSCORE: () => void

  zrankMember: string
  setZrankMember: (v: string) => void
  onZRANK: () => void

  zrangeStart: string
  zrangeStop: string
  setZrangeStart: (v: string) => void
  setZrangeStop: (v: string) => void
  onZRANGE: () => void

  zremMember: string
  setZremMember: (v: string) => void
  onZREM: () => void
}

export function OperationForm(props: OperationFormProps) {
  const {
    activeOp,
    onChangeOp,
    onReset,
    sortedNodes,
    zaddMember,
    zaddScore,
    setZaddMember,
    setZaddScore,
    onZADD,
    zscoreMember,
    setZscoreMember,
    onZSCORE,
    zrankMember,
    setZrankMember,
    onZRANK,
    zrangeStart,
    zrangeStop,
    setZrangeStart,
    setZrangeStop,
    onZRANGE,
    zremMember,
    setZremMember,
    onZREM,
  } = props

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-1 pl-2">
        <div className="flex flex-wrap gap-1">
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              onClick={() => onChangeOp(op.id)}
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
          onClick={onReset}
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
                onKeyDown={(e) => e.key === 'Enter' && onZADD()}
                placeholder="frank"
                className={inputClass}
              />
            </Field>
            <Field label="Score" className="w-28">
              <input
                inputMode="decimal"
                value={zaddScore}
                onChange={(e) => setZaddScore(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onZADD()}
                placeholder="3000"
                className={inputClass}
              />
            </Field>
            <button onClick={onZADD} className={runButtonClass}>
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
            <button onClick={onZSCORE} className={runButtonClass} disabled={!zscoreMember}>
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
            <button onClick={onZRANK} className={runButtonClass} disabled={!zrankMember}>
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
            <button onClick={onZRANGE} className={runButtonClass}>
              Run ZRANGE
            </button>
            <p className="w-full text-xs text-muted-foreground">
              Index âm: <code className="font-mono">-1</code> = phần tử cuối, <code className="font-mono">0 -1</code> ={' '}
              lấy tất cả.
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
            <button onClick={onZREM} className={runButtonClass} disabled={!zremMember}>
              Run ZREM
            </button>
          </div>
        )}
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
