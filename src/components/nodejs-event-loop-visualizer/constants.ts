import type { PhaseId, MicrotaskId } from './types'

export const STEP_DELAY_MS = 2500

export const PHASE_COLORS: Record<PhaseId, string> = {
  timers: '#f59e0b',
  pending: '#ef4444',
  idle: '#6b7280',
  poll: '#3b82f6',
  check: '#10b981',
  close: '#8b5cf6',
}

export const MICROTASK_COLORS: Record<MicrotaskId, string> = {
  nexttick: '#ec4899',
  promise: '#06b6d4',
}

export const PHASE_ARCS: {
  id: PhaseId
  dashArray: string
  dashOffset: string
  label: string
  sublabel: string
  labelX: number
  labelY: number
  sublabelX: number
  sublabelY: number
  textAnchor: 'inherit' | 'start' | 'middle' | 'end'
}[] = [
  { id: 'timers', dashArray: '158 847', dashOffset: '251', label: 'Timers', sublabel: 'setTimeout / setInterval', labelX: 380, labelY: 40, sublabelX: 380, sublabelY: 60, textAnchor: 'middle' },
  { id: 'pending', dashArray: '99 906', dashOffset: '90', label: 'Pending CB', sublabel: 'TCP errors', labelX: 440, labelY: 180, sublabelX: 450, sublabelY: 200, textAnchor: 'start' },
  { id: 'idle', dashArray: '79 926', dashOffset: '993', label: 'Idle/Prepare', sublabel: 'internal', labelX: 440, labelY: 305, sublabelX: 440, sublabelY: 325, textAnchor: 'start' },
  { id: 'poll', dashArray: '296 709', dashOffset: '911', label: 'Poll', sublabel: 'I/O callbacks', labelX: 240, labelY: 460, sublabelX: 240, sublabelY: 480, textAnchor: 'middle' },
  { id: 'check', dashArray: '197 808', dashOffset: '612', label: 'Check', sublabel: 'setImmediate', labelX: 40, labelY: 260, sublabelX: 40, sublabelY: 280, textAnchor: 'end' },
  { id: 'close', dashArray: '158 847', dashOffset: '412', label: 'Close CB', sublabel: "socket.on('close')", labelX: 100, labelY: 40, sublabelX: 100, sublabelY: 60, textAnchor: 'middle' },
]

export const QUEUE_COLORS: Record<string, string> = {
  nexttick: 'border-pink-800 text-pink-300',
  promise: 'border-cyan-800 text-cyan-300',
  timer: 'border-amber-800 text-amber-300',
  poll: 'border-blue-800 text-blue-300',
  check: 'border-emerald-800 text-emerald-300',
  close: 'border-purple-800 text-purple-300',
}

export const QUEUE_DOT_COLORS: Record<string, string> = {
  nexttick: '#ec4899',
  promise: '#06b6d4',
  timer: '#f59e0b',
  poll: '#3b82f6',
  check: '#10b981',
  close: '#8b5cf6',
}
