// Define attachment types
interface BaseAttachment {
    type: string
  }
  
  interface LinkAttachment extends BaseAttachment {
    type: 'link'
    image: string
    url: string
    text: string
  }
  
  interface ImageAttachment extends BaseAttachment {
    type: 'image'
    image: string
    text: string
  }
  
  interface VoiceAttachment extends BaseAttachment {
    type: 'voice'
    audio: string
  }
  
  interface VideoAttachment extends BaseAttachment {
    type: 'video'
    video: string
    thumbnail?: string
    duration?: number
    text?: string
  }
  
  interface ScreenShareAttachment extends BaseAttachment {
    type: 'screenshare'
    stream: MediaStream
    thumbnail?: string
    text?: string
  }
  
  export type MessageAttachment = LinkAttachment | ImageAttachment | VoiceAttachment | VideoAttachment | ScreenShareAttachment
  
  export interface ChatMessage {
    type: 'sent' | 'received' | 'separator'
    text: string
    time: string
    attachments: MessageAttachment[]
  }
  
  export interface ChatUser {
    name: string
    photo: string
    role: string
    bio: string
    age: number
    location: string
  }
  
  export interface Conversation {
    id: number
    user: ChatUser
    messages: ChatMessage[]
  }