import type { Thread } from './types'

export const THREADS: Thread[] = [
  { id: 'group', name: 'The Girls', memberIds: ['mom', 'winnie', 'amy', 'holly'] },
  { id: 'mom-winnie', name: 'Mom & Winnie', memberIds: ['mom', 'winnie'] },
  { id: 'mom-amy', name: 'Mom & Amy', memberIds: ['mom', 'amy'] },
  { id: 'mom-holly', name: 'Mom & Holly', memberIds: ['mom', 'holly'] },
]

export function threadOf(id: string): Thread {
  return THREADS.find((t) => t.id === id) ?? THREADS[0]
}
