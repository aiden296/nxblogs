'use client'

import { useEffect, useState } from 'react'
import { STEP_DELAY_MS } from './constants'
import { scenarios } from './scenarios'
import { CodePanel } from './code-panel'
import { QueuePanel } from './queue-panel'
import { EventLoopPhases } from './event-loop-phases'
import { ConsolePanel } from './console-panel'
import type { Scenario, Step } from './types'

export function BrowserEventLoopVisualizer() {
  const [scenario, setScenario] = useState<Scenario>(scenarios[0])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  const steps = scenario.steps
  const step: Step = steps[stepIdx]

  useEffect(() => {
    if (!playing) {
      return
    }

    if (stepIdx >= steps.length - 1) {
      setPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setStepIdx((i) => i + 1)
    }, STEP_DELAY_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [playing, stepIdx, steps.length])

  function handleScenarioChange(id: string) {
    const next = scenarios.find((s) => s.id === id)

    if (!next) {
      return
    }

    setScenario(next)
    setStepIdx(0)
    setPlaying(false)
  }

  function handleReset() {
    setStepIdx(0)
    setPlaying(false)
  }

  return (
    <div className="not-prose my-8 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={scenario.id}
          onChange={(e) => handleScenarioChange(e.target.value)}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleReset}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted"
        >
          Reset
        </button>
      </div>

      <CodePanel code={scenario.code} highlightLines={step.highlightLines} />

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-mono">
            Step {stepIdx + 1} / {steps.length}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed">{step.description}</p>
        <div className="mt-3 flex items-center gap-1.5">
          <button
            onClick={() => {
              setPlaying(false)
              setStepIdx((i) => Math.max(0, i - 1))
            }}
            disabled={stepIdx === 0}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs disabled:opacity-30"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={stepIdx >= steps.length - 1 && !playing}
            className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-30"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              setPlaying(false)
              setStepIdx((i) => Math.min(steps.length - 1, i + 1))
            }}
            disabled={stepIdx >= steps.length - 1}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      <EventLoopPhases currentPhase={step.phase} />

      <div className="flex gap-2 overflow-x-auto">
        <QueuePanel
          title="Call Stack"
          items={step.callStack}
          variant="callstack"
          isActive={step.callStack.length > 0}
        />
        <QueuePanel title="Web APIs" items={step.webAPIs} variant="webapi" isActive={step.webAPIs.length > 0} />
        <QueuePanel
          title="Task Queue"
          items={step.taskQueue}
          variant="task"
          isActive={step.phase === 'macrotask'}
        />
        <QueuePanel
          title="Microtask Queue"
          items={step.microtaskQueue}
          variant="microtask"
          isActive={step.phase === 'microtask'}
        />
        <QueuePanel title="requestAnimationFrame Queue" items={step.rafQueue} variant="raf" isActive={step.phase === 'raf'} />
      </div>

      <ConsolePanel output={step.consoleOutput} />
    </div>
  )
}
