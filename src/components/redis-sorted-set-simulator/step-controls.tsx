import type { Step } from '@/components/redis-sorted-set-simulator/types'

export function StepControls({
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
