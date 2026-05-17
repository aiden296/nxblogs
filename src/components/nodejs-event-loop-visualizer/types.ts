export type PhaseId = 'timers' | 'pending' | 'idle' | 'poll' | 'check' | 'close'

export type MicrotaskId = 'nexttick' | 'promise'

export type CodeLine = {
  text: string
  id: string
}

export type StepBadge = {
  text: string
  color: string
}

export type Step = {
  title: string
  desc: string
  activePhase: PhaseId | null
  activeMicrotask?: MicrotaskId
  highlightLines: string[]
  executedLines?: string[]
  callStack: string[]
  queues: Partial<Record<string, string[]>>
  threadPool: string[]
  badge: StepBadge
}

export type Scenario = {
  id: string
  title: string
  codeLines: CodeLine[]
  steps: Step[]
}
