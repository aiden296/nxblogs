export const STEP_DELAY_MS = 1200

export const PHASE_LABELS: Record<string, string> = {
  'idle': 'Idle',
  'macrotask': 'Macrotask',
  'microtask': 'Microtask',
  'raf': 'requestAnimationFrame',
  'render': 'Render',
  'idle-callback': 'Idle Callback',
}

export const PHASE_COLORS: Record<string, string> = {
  'idle': 'bg-muted',
  'macrotask': 'bg-blue-500/20 border-blue-500',
  'microtask': 'bg-purple-500/20 border-purple-500',
  'raf': 'bg-green-500/20 border-green-500',
  'render': 'bg-rose-500/20 border-rose-500',
  'idle-callback': 'bg-gray-500/20 border-gray-500',
}
