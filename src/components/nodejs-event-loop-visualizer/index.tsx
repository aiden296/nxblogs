'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { scenario } from './scenario'
import { STEP_DELAY_MS } from './constants'
import { EventLoopDiagram } from './event-loop-diagram'
import { CodePanel, CallStackPanel, StepDescription, StepControls } from '@/components/event-loop-shared'
import { QueuesPanel } from './queues-panel'
import type { PhaseId } from './types'

export function NodejsEventLoopVisualizer() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = scenario.steps
  const step = currentStep >= 0 ? steps[currentStep] : null

  const executedLineIds = useMemo(() => {
    const ids = new Set<string>()
    for (let i = 0; i <= currentStep; i++) {
      steps[i]?.executedLines?.forEach((id) => ids.add(id))
    }
    return ids
  }, [currentStep, steps])

  const donePhases = useMemo(() => {
    const phases = new Set<PhaseId>()
    for (let i = 0; i < currentStep; i++) {
      const p = steps[i]?.activePhase
      if (p) phases.add(p)
    }
    return phases
  }, [currentStep, steps])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) return prev + 1
      return prev
    })
  }, [steps.length])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const resetSteps = useCallback(() => {
    setCurrentStep(-1)
    setPlaying(false)
  }, [])

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current)
      autoRef.current = null
    }
    setPlaying(false)
  }, [])

  const toggleAuto = useCallback(() => {
    if (playing) {
      stopAuto()
    } else {
      setPlaying(true)
    }
  }, [playing, stopAuto])

  useEffect(() => {
    if (!playing) {
      if (autoRef.current) {
        clearInterval(autoRef.current)
        autoRef.current = null
      }
      return
    }

    autoRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          stopAuto()
          return prev
        }
        return prev + 1
      })
    }, STEP_DELAY_MS)

    return () => {
      if (autoRef.current) {
        clearInterval(autoRef.current)
        autoRef.current = null
      }
    }
  }, [playing, steps.length, stopAuto])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextStep()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevStep()
      }
      if (e.key === 'r' || e.key === 'R') {
        resetSteps()
      }
      if (e.key === 'Escape') {
        stopAuto()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextStep, prevStep, resetSteps, stopAuto])

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
      <style>{`
        @keyframes queuePush {
          from { opacity: 0; transform: translateX(-12px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes stackPush {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>

      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Event Loop Architecture</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Step</span>
          <span className="font-mono text-white font-bold">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-95 shrink-0 border-r border-slate-800 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Request Handler Code</h3>
            <CodePanel
              codeLines={scenario.codeLines}
              highlightLines={step?.highlightLines || []}
              executedLineIds={executedLineIds}
            />
          </div>

          <div className="h-48 shrink-0 border-t border-slate-800 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Call Stack</h3>
            <CallStackPanel items={step?.callStack || []} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative p-6">
          <div className="relative w-full max-w-120">
            <EventLoopDiagram
              activePhase={step?.activePhase || null}
              activeMicrotask={step?.activeMicrotask}
              donePhases={donePhases}
            />
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <StepDescription
              badge={step?.badge || { text: '0', color: '#3b82f6' }}
              title={step?.title || 'Press "Next" to start'}
              desc={step?.desc || 'Walk through each step of an HTTP request lifecycle in the Node.js event loop'}
            />
          </div>
        </div>

        <div className="w-70 shrink-0 border-l border-slate-800 flex flex-col p-4 gap-4 overflow-y-auto">
          <QueuesPanel queues={step?.queues || {}} threadPool={step?.threadPool || []} />
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-800 bg-slate-900/80 px-6 py-3">
        <StepControls
          currentStep={currentStep}
          totalSteps={steps.length}
          playing={playing}
          onPrev={prevStep}
          onNext={nextStep}
          onReset={resetSteps}
          onToggleAuto={toggleAuto}
        />
      </footer>
    </div>
  )
}
