'use client'

import { useEffect, useMemo, useState } from 'react'
import { INITIAL_DATA, STEP_DELAY_MS } from '@/components/redis-sorted-set-simulator/constants'
import { DualStructurePanel } from '@/components/redis-sorted-set-simulator/dual-structure-panel'
import { OperationForm } from '@/components/redis-sorted-set-simulator/operation-form'
import {
  genZADDSteps,
  genZRANGESteps,
  genZRANKSteps,
  genZREMSteps,
  genZSCORESteps,
} from '@/components/redis-sorted-set-simulator/step-generators'
import { StepControls } from '@/components/redis-sorted-set-simulator/step-controls'
import type { OpType, Step } from '@/components/redis-sorted-set-simulator/types'
import { getSortedNodes } from '@/components/redis-sorted-set-simulator/utils'

export function RedisSortedSetSimulator() {
  const [members, setMembers] = useState(() => new Map(INITIAL_DATA))
  const [activeOp, setActiveOp] = useState<OpType>('ZADD')
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  const [zaddMember, setZaddMember] = useState('')
  const [zaddScore, setZaddScore] = useState('')
  const [zscoreMember, setZscoreMember] = useState('')
  const [zrankMember, setZrankMember] = useState('')
  const [zrangeStart, setZrangeStart] = useState('0')
  const [zrangeStop, setZrangeStop] = useState('-1')
  const [zremMember, setZremMember] = useState('')

  const sortedNodes = useMemo(() => getSortedNodes(members), [members])
  const currentStep: Step | null = steps[stepIdx] ?? null
  const displayedNodes = currentStep?.state ?? sortedNodes
  const displayedMembers = useMemo(() => {
    if (!currentStep?.state) return members
    return new Map(currentStep.state.map((n) => [n.member, n.score]))
  }, [currentStep, members])

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStepIdx((i) => i + 1), STEP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [playing, stepIdx, steps.length])

  function runOp(generated: Step[], commit?: () => Map<string, number>) {
    setSteps(generated)
    setStepIdx(0)
    setPlaying(true)
    if (commit) {
      const next = commit()
      setTimeout(() => setMembers(next), generated.length * STEP_DELAY_MS + 200)
    }
  }

  function handleZADD() {
    if (!zaddMember.trim() || !zaddScore.trim()) return
    const score = parseFloat(zaddScore)
    if (isNaN(score) || !isFinite(score)) return
    const member = zaddMember.trim()
    runOp(genZADDSteps(member, score, members), () => {
      const next = new Map(members)
      next.set(member, score)
      return next
    })
    setZaddMember('')
    setZaddScore('')
  }

  function handleZSCORE() {
    if (!zscoreMember) return
    runOp(genZSCORESteps(zscoreMember, members))
  }

  function handleZRANK() {
    if (!zrankMember) return
    runOp(genZRANKSteps(zrankMember, members))
  }

  function handleZRANGE() {
    const start = parseInt(zrangeStart, 10)
    const stop = parseInt(zrangeStop, 10)
    if (isNaN(start) || isNaN(stop)) return
    runOp(genZRANGESteps(start, stop, members))
  }

  function handleZREM() {
    if (!zremMember) return
    const exists = members.has(zremMember)
    runOp(
      genZREMSteps(zremMember, members),
      exists
        ? () => {
            const next = new Map(members)
            next.delete(zremMember)
            return next
          }
        : undefined
    )
    setZremMember('')
  }

  function handleReset() {
    setMembers(new Map(INITIAL_DATA))
    setSteps([])
    setStepIdx(0)
    setPlaying(false)
  }

  return (
    <div className="not-prose my-8 space-y-4">
      <OperationForm
        activeOp={activeOp}
        onChangeOp={setActiveOp}
        onReset={handleReset}
        sortedNodes={sortedNodes}
        zaddMember={zaddMember}
        zaddScore={zaddScore}
        setZaddMember={setZaddMember}
        setZaddScore={setZaddScore}
        onZADD={handleZADD}
        zscoreMember={zscoreMember}
        setZscoreMember={setZscoreMember}
        onZSCORE={handleZSCORE}
        zrankMember={zrankMember}
        setZrankMember={setZrankMember}
        onZRANK={handleZRANK}
        zrangeStart={zrangeStart}
        zrangeStop={zrangeStop}
        setZrangeStart={setZrangeStart}
        setZrangeStop={setZrangeStop}
        onZRANGE={handleZRANGE}
        zremMember={zremMember}
        setZremMember={setZremMember}
        onZREM={handleZREM}
      />

      <StepControls
        step={currentStep}
        stepIdx={stepIdx}
        totalSteps={steps.length}
        playing={playing}
        onPrev={() => {
          setPlaying(false)
          setStepIdx((i) => Math.max(0, i - 1))
        }}
        onNext={() => {
          setPlaying(false)
          setStepIdx((i) => Math.min(steps.length - 1, i + 1))
        }}
        onPlay={() => setPlaying((p) => !p)}
      />

      <DualStructurePanel nodes={displayedNodes} allMembers={displayedMembers} step={currentStep} />
    </div>
  )
}
