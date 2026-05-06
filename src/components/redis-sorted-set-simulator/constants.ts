import type { OpType } from '@/components/redis-sorted-set-simulator/types'

export const INITIAL_DATA: [string, number][] = [
  ['alice', 1500],
  ['aiden', 2400],
  ['eve', 900],
]

export const MAX_LEVEL = 4

export const HASH_BUCKETS = 8

export const STEP_DELAY_MS = 1100

export const OPERATIONS: { id: OpType; label: string; description: string }[] = [
  { id: 'ZADD', label: 'ZADD', description: 'Thêm hoặc cập nhật score — cập nhật cả hash table và skip list' },
  { id: 'ZSCORE', label: 'ZSCORE', description: 'Lấy score qua hash table — O(1)' },
  { id: 'ZRANK', label: 'ZRANK', description: 'Đếm rank bằng cách traverse skip list, cộng dồn span' },
  { id: 'ZRANGE', label: 'ZRANGE', description: 'Tìm node bắt đầu rồi walk forward trên level 1' },
  { id: 'ZREM', label: 'ZREM', description: 'Xoá member khỏi cả hash table và skip list' },
]

export const inputClass =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'

export const runButtonClass =
  'rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
