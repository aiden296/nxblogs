'use client'

import type { PhaseId } from './types'
import { PHASE_ARCS, PHASE_COLORS } from './constants'

export function EventLoopDiagram({
  activePhase,
  donePhases,
}: {
  activePhase: PhaseId | null
  donePhases: Set<PhaseId>
}) {
  return (
    <svg width="100%" viewBox="-80 -40 700 600">
      <defs>
        <filter id="glow-browser">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="240" cy="240" r="160" fill="none" stroke="#1e293b" strokeWidth="44" />

      {PHASE_ARCS.map((arc) => {
        const isActive = activePhase === arc.id
        const isDone = donePhases.has(arc.id)
        const color = PHASE_COLORS[arc.id]

        return (
          <circle
            key={arc.id}
            cx="240"
            cy="240"
            r="160"
            fill="none"
            stroke={color}
            strokeWidth="42"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            style={{
              opacity: isActive ? 1 : isDone ? 0.5 : 0.25,
              filter: isActive ? 'drop-shadow(0 0 12px currentColor)' : 'none',
              color,
              transition: 'opacity 0.5s, filter 0.5s',
            }}
          />
        )
      })}

      <circle cx="240" cy="240" r="105" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

      <text x="240" y="225" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600" letterSpacing="1.5">
        EVENT
      </text>
      <text x="240" y="245" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600" letterSpacing="1.5">
        LOOP
      </text>
      <text x="240" y="270" textAnchor="middle" fill="#334155" fontSize="10">
        (one task per turn)
      </text>

      {PHASE_ARCS.map((arc) => {
        const isActive = activePhase === arc.id
        const isDone = donePhases.has(arc.id)
        const color = PHASE_COLORS[arc.id]

        return (
          <g key={`label-${arc.id}`}>
            <text
              x={arc.labelX}
              y={arc.labelY}
              textAnchor={arc.textAnchor}
              fill={color}
              fontSize="16"
              fontWeight="500"
              style={{
                opacity: isActive ? 1 : isDone ? 0.6 : 0.4,
                fontWeight: isActive ? 700 : 500,
                transition: 'opacity 0.5s, font-weight 0.3s',
              }}
            >
              {arc.label}
            </text>
            <text x={arc.sublabelX} y={arc.sublabelY} textAnchor={arc.textAnchor} fill={color} fontSize="11" opacity="0.5">
              {arc.sublabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
