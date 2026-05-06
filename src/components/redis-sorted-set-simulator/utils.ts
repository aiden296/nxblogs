import { MAX_LEVEL } from '@/components/redis-sorted-set-simulator/constants'
import type { SortedNode } from '@/components/redis-sorted-set-simulator/types'

export function memberHeight(member: string): number {
  let h = 5381
  for (let i = 0; i < member.length; i++) h = ((h << 5) + h + member.charCodeAt(i)) | 0
  let rng = ((h >>> 0) % 10000) / 10000
  let height = 1
  while (rng < 0.5 && height < MAX_LEVEL) {
    rng *= 2
    height++
  }
  return height
}

export function getSortedNodes(members: Map<string, number>): SortedNode[] {
  return Array.from(members.entries())
    .map(([member, score]) => ({ member, score, height: memberHeight(member) }))
    .sort((a, b) => a.score - b.score || a.member.localeCompare(b.member))
}

export function bucketOf(member: string, bucketCount: number): number {
  let h = 0
  for (let i = 0; i < member.length; i++) h = (h * 31 + member.charCodeAt(i)) | 0
  return Math.abs(h) % bucketCount
}

export function formatScore(s: number): string {
  return s % 1 === 0 ? s.toFixed(0) : String(s)
}
