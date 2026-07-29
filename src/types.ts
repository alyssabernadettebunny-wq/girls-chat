export interface Member {
  id: string
  name: string
  emoji: string
  color: string
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  time: number
}
