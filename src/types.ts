export interface Member {
  id: string
  name: string
  emoji: string
  color: string
}

export interface Thread {
  id: string
  name: string
  memberIds: string[]
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  text: string
  time: number
  imageDataUrl?: string
  replyToId?: string
  editedAt?: number
  reactions?: Record<string, string[]>
}
