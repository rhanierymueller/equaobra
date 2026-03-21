export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  professionalId: string
  professionalName: string
  professionalInitials: string
  professionalAvatarUrl?: string
  messages: ChatMessage[]
}
