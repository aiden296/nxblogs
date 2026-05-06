import { MAX_LEVEL } from '@/components/redis-sorted-set-simulator/constants'
import type { SortedNode, Step } from '@/components/redis-sorted-set-simulator/types'
import { formatScore, getSortedNodes, memberHeight } from '@/components/redis-sorted-set-simulator/utils'

export function traverseToTarget(sorted: SortedNode[], target: number, targetMember?: string): Step[] {
  const steps: Step[] = []
  let currentIdx = -1
  const visited: string[] = []

  for (let level = MAX_LEVEL; level >= 1; level--) {
    while (true) {
      let nextIdx = -1
      for (let i = currentIdx + 1; i < sorted.length; i++) {
        if (sorted[i].height >= level) {
          nextIdx = i
          break
        }
      }
      const fromName = currentIdx === -1 ? 'HEAD' : sorted[currentIdx].member
      if (nextIdx === -1) {
        steps.push({
          description: `Level ${level}: từ ${fromName} → NIL. Xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
        })
        break
      }
      const next = sorted[nextIdx]
      const isLess = next.score < target || (next.score === target && !!targetMember && next.member < targetMember)
      if (isLess) {
        steps.push({
          description: `Level ${level}: ${next.member} (score ${formatScore(next.score)}) < target ${formatScore(target)} — đi forward.`,
          skipFocus: next.member,
          skipLevel: level,
          skipVisited: [...visited, next.member],
          state: sorted,
        })
        currentIdx = nextIdx
        visited.push(next.member)
      } else {
        steps.push({
          description: `Level ${level}: ${next.member} (score ${formatScore(next.score)}) ≥ ${formatScore(target)} — dừng, xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
        })
        break
      }
    }
  }
  return steps
}

export function genZADDSteps(member: string, score: number, members: Map<string, number>): Step[] {
  const steps: Step[] = []
  const exists = members.has(member)
  const sorted = getSortedNodes(members)

  steps.push({
    description: `1. Hash table lookup: kiểm tra "${member}" đã tồn tại chưa.`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  if (exists) {
    const oldScore = members.get(member)!
    steps.push({
      description: `Hash table trả về score cũ = ${formatScore(oldScore)}. Cần xoá node cũ trong skip list.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    })

    const findOld = traverseToTarget(sorted, oldScore, member)
    findOld.forEach((s) => steps.push({ ...s, description: `Tìm node "${member}" để xoá — ${s.description}` }))

    const tempMembers = new Map(members)
    tempMembers.delete(member)
    const tempSorted = getSortedNodes(tempMembers)
    steps.push({
      description: `Xoá node "${member}" khỏi mọi level của skip list.`,
      state: sorted,
      removing: member,
      skipFocus: member,
    })

    const findNew = traverseToTarget(tempSorted, score, member)
    findNew.forEach((s) =>
      steps.push({
        ...s,
        description: `Tìm vị trí mới cho score ${formatScore(score)} — ${s.description}`,
        pending: { member, score, height: memberHeight(member) },
      })
    )

    const finalMembers = new Map(tempMembers)
    finalMembers.set(member, score)
    const finalSorted = getSortedNodes(finalMembers)
    steps.push({
      description: `Insert node "${member}" với score mới ${formatScore(score)} vào skip list.`,
      state: finalSorted,
      skipFocus: member,
    })
    steps.push({
      description: `Cập nhật hash table: "${member}" → ${formatScore(score)}.`,
      hashHighlight: member,
      hashAction: 'update',
      state: finalSorted,
    })
  } else {
    const height = memberHeight(member)
    steps.push({
      description: `Hash table trả (nil) → đây là member mới. Tung đồng xu: chiều cao = ${height}.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    })

    const findPos = traverseToTarget(sorted, score, member)
    findPos.forEach((s) =>
      steps.push({
        ...s,
        description: `Tìm vị trí chèn — ${s.description}`,
        pending: { member, score, height },
      })
    )

    const finalMembers = new Map(members)
    finalMembers.set(member, score)
    const finalSorted = getSortedNodes(finalMembers)
    steps.push({
      description: `Insert node "${member}" với score ${formatScore(score)} vào skip list (cập nhật forward pointers).`,
      state: finalSorted,
      skipFocus: member,
    })
    steps.push({
      description: `Insert vào hash table: "${member}" → ${formatScore(score)}.`,
      hashHighlight: member,
      hashAction: 'insert',
      state: finalSorted,
    })
  }
  return steps
}

export function genZSCORESteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  return [
    {
      description: `1. Hash member name "${member}" → tìm bucket trong hash table.`,
      hashHighlight: member,
      hashAction: 'lookup',
      state: sorted,
    },
    exists
      ? {
          description: `2. Bucket có entry → trả về score ${formatScore(members.get(member)!)}. Skip list không cần thiết — O(1).`,
          hashHighlight: member,
          hashAction: 'lookup',
          state: sorted,
        }
      : {
          description: `2. Bucket trống — trả (nil).`,
          state: sorted,
        },
  ]
}

export function genZRANKSteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  if (!exists) {
    return [
      {
        description: `Hash table cho biết "${member}" không tồn tại → trả (nil).`,
        hashHighlight: member,
        hashAction: 'lookup',
        state: sorted,
      },
    ]
  }

  const target = members.get(member)!
  const steps: Step[] = []
  steps.push({
    description: `Hash table xác nhận "${member}" tồn tại. Bây giờ duyệt skip list để đếm rank (cộng dồn span).`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  const visited: string[] = []
  let currentIdx = -1
  let rank = 0

  for (let level = MAX_LEVEL; level >= 1; level--) {
    while (true) {
      let nextIdx = -1
      for (let i = currentIdx + 1; i < sorted.length; i++) {
        if (sorted[i].height >= level) {
          nextIdx = i
          break
        }
      }
      const fromName = currentIdx === -1 ? 'HEAD' : sorted[currentIdx].member
      if (nextIdx === -1) {
        steps.push({
          description: `Level ${level}: từ ${fromName} → NIL. Xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
          rankCounter: rank,
        })
        break
      }
      const next = sorted[nextIdx]
      const reachedTarget = next.score > target || (next.score === target && next.member >= member)
      if (reachedTarget) {
        steps.push({
          description: `Level ${level}: ${next.member} ≥ target — dừng, xuống level ${level - 1}.`,
          skipFocus: fromName,
          skipLevel: level,
          skipVisited: [...visited],
          state: sorted,
          rankCounter: rank,
        })
        break
      }
      const span = nextIdx - currentIdx
      rank += span
      steps.push({
        description: `Level ${level}: nhảy đến ${next.member} (span ${span}). Rank cộng dồn = ${rank}.`,
        skipFocus: next.member,
        skipLevel: level,
        skipVisited: [...visited, next.member],
        state: sorted,
        rankCounter: rank,
      })
      currentIdx = nextIdx
      visited.push(next.member)
      if (next.member === member) break
    }
    if (currentIdx >= 0 && sorted[currentIdx].member === member) break
  }

  steps.push({
    description: `Tìm thấy "${member}". Trả về rank = ${rank} (0-based: phần tử trước "${member}" có ${rank} node).`,
    skipFocus: member,
    skipVisited: [...visited],
    state: sorted,
    rankCounter: rank,
  })
  return steps
}

export function genZRANGESteps(start: number, stop: number, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const len = sorted.length
  const s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len)
  const e = stop < 0 ? len + stop : Math.min(stop, len - 1)

  const steps: Step[] = []
  if (s > e || len === 0) {
    return [
      {
        description: `Range rỗng (start ${start} → stop ${stop}). Trả (empty array).`,
        state: sorted,
      },
    ]
  }

  steps.push({
    description: `Skip list traversal: nhảy đến rank = ${s} (cộng dồn span trên các level).`,
    skipFocus: 'HEAD',
    skipLevel: MAX_LEVEL,
    skipVisited: [],
    state: sorted,
  })

  const visited: string[] = []
  for (let i = 0; i <= s; i++) {
    if (i < sorted.length) {
      visited.push(sorted[i].member)
      steps.push({
        description: `Đến rank ${i}: "${sorted[i].member}" (score ${formatScore(sorted[i].score)}).`,
        skipFocus: sorted[i].member,
        skipLevel: 1,
        skipVisited: [...visited],
        state: sorted,
      })
      if (i === s) break
    }
  }

  steps.push({
    description: `Bắt đầu thu thập members. Walk forward trên level 1 cho đến rank ${e}.`,
    skipFocus: sorted[s].member,
    skipLevel: 1,
    skipVisited: [...visited],
    state: sorted,
  })

  for (let i = s + 1; i <= e; i++) {
    visited.push(sorted[i].member)
    steps.push({
      description: `Thu thập rank ${i}: "${sorted[i].member}".`,
      skipFocus: sorted[i].member,
      skipLevel: 1,
      skipVisited: [...visited],
      state: sorted,
    })
  }

  steps.push({
    description: `Hoàn tất. Trả về ${e - s + 1} members từ rank ${s} đến ${e}.`,
    skipVisited: [...visited],
    state: sorted,
  })
  return steps
}

export function genZREMSteps(member: string, members: Map<string, number>): Step[] {
  const sorted = getSortedNodes(members)
  const exists = members.has(member)
  if (!exists) {
    return [
      {
        description: `Hash table lookup → "${member}" không tồn tại. Trả (integer) 0.`,
        hashHighlight: member,
        hashAction: 'lookup',
        state: sorted,
      },
    ]
  }

  const target = members.get(member)!
  const steps: Step[] = []
  steps.push({
    description: `1. Hash table lookup: tìm "${member}".`,
    hashHighlight: member,
    hashAction: 'lookup',
    state: sorted,
  })

  const find = traverseToTarget(sorted, target, member)
  find.forEach((s) => steps.push({ ...s, description: `Tìm node để xoá — ${s.description}` }))

  const next = new Map(members)
  next.delete(member)
  const finalSorted = getSortedNodes(next)

  steps.push({
    description: `Xoá node "${member}" khỏi tất cả forward pointers ở mọi level của skip list.`,
    state: sorted,
    removing: member,
    skipFocus: member,
  })

  steps.push({
    description: `Xoá entry khỏi hash table.`,
    hashHighlight: member,
    hashAction: 'delete',
    state: finalSorted,
  })

  return steps
}
