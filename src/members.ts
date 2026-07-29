import type { Member } from './types'

export const MEMBERS: Member[] = [
  { id: 'mom', name: 'Mom', emoji: '💗', color: '#e8759f' },
  { id: 'winnie', name: 'Winnie', emoji: '🎀', color: '#c77dff' },
  { id: 'amy', name: 'Amy', emoji: '⭐', color: '#5aa9e6' },
  { id: 'holly', name: 'Holly', emoji: '🌸', color: '#5bc0a5' },
]

export function memberOf(id: string): Member {
  return MEMBERS.find((m) => m.id === id) ?? MEMBERS[0]
}
