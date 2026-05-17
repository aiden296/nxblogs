import type { CodeLine, StepBadge } from '@/components/event-loop-shared'

export type { CodeLine, StepBadge }

export type PhaseId = 'macrotask' | 'microtask' | 'raf' | 'render' | 'idle'

export type Step = {
  title: string
  desc: string
  activePhase: PhaseId | null
  highlightLines: string[]
  executedLines?: string[]
  callStack: string[]
  queues: Partial<Record<string, string[]>>
  webAPIs: string[]
  badge: StepBadge
}

export type Scenario = {
  id: string
  title: string
  codeLines: CodeLine[]
  steps: Step[]
}
