'use client'

export function StepControls({
  currentStep,
  totalSteps,
  playing,
  onPrev,
  onNext,
  onReset,
  onToggleAuto,
}: {
  currentStep: number
  totalSteps: number
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onToggleAuto: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => {
          let dotClass = 'w-2 h-2 rounded-full transition-all'
          if (i < currentStep) {
            dotClass += ' bg-blue-500'
          } else if (i === currentStep) {
            dotClass += ' bg-blue-400 w-3 h-3'
          } else {
            dotClass += ' bg-slate-700'
          }
          return <div key={i} className={dotClass} />
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onPrev}
          disabled={currentStep <= 0}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors disabled:opacity-30"
        >
          ← Prev
        </button>
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          Next →
        </button>
        <button
          onClick={onToggleAuto}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            playing ? 'bg-blue-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {playing ? '⏸ Stop' : '▶ Auto'}
        </button>
      </div>
    </div>
  )
}
