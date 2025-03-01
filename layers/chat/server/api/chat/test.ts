import type { Peer, Message } from "crossws"
import { getQuery } from "ufo"
import logger from "../../utils/logger"

interface ChatMessage {
  type: 'message' | 'system' | 'error' | 'human_feedback' | 'state_update';
  message: string;
  timestamp?: string;
  userId?: string;
  code?: string;
  feedback?: string;
  skipHumanFeedback?: boolean;
  useGraph?: boolean;
  researchId?: string;
  workspaceId?: string;
  idToken?: string;
}

const users = new Map<string, { online: boolean }>()
let room = "BOOK_RESEARCH"

// Helper function to get user ID from query parameters
function getUserId(peer: Peer): string {
  // Get URL from peer connection
  const url = peer.request?.url || ''
  const query = getQuery(url)
  const userId = query.userId
  return typeof userId === 'string' ? userId : (Array.isArray(userId) ? userId[0] : 'anonymous')
}

export default defineWebSocketHandler({
  async open(peer) {
    try {
      const userId = getUserId(peer)
      
      // Check if user already exists
      if (users.has(userId)) {
        const existingUser = users.get(userId)
        if (existingUser && existingUser.online) {
          // Update existing user status
          users.set(userId, { online: true })
        }
      } else {
        // Add new user
        users.set(userId, { online: true })
      }

      room = getRoomId(peer) || 'BOOK_RESEARCH'
      
      // Subscribe to room and notify
      peer.subscribe(room)
      peer.send(JSON.stringify({ 
        type: 'system', 
        message: 'Connected to Book Research Agency',
        userId: userId,
        timestamp: new Date().toISOString()
      }))
      
      const stats = getStats()
      logger.info({ message: `User ${userId} connected to Book Research. Online users: ${stats.online}/${stats.total}` }, peer)
    } catch (error) {
      logger.error({ message: 'Error in open handler', error: error as Error }, peer)
      peer.send(JSON.stringify({ 
        type: 'error',
        message: 'Failed to establish connection to Book Research Agency',
        timestamp: new Date().toISOString()
      }))
      peer.close()
    }
  },

  close(peer) {
    try {
      const userId = getUserId(peer)
      
      if (userId) {
        users.delete(userId)
        const stats = getStats()
        logger.info({ message: `User ${userId} disconnected from Book Research. Online users: ${stats.online}/${stats.total}` }, peer)
      }

      peer.unsubscribe(room)
    } catch (error) {
      logger.error({ message: 'Error in close handler', error: error as Error }, peer)
    }
  },

  async message(peer, message) {
    try {
      console.log('MESSAGE', message)
      if (!message) return

      const messageContent = typeof message === 'string' ? message : message.toString()
      logger.info({ message: `Received message for Book Research: ${messageContent}` }, peer)

      if (messageContent === 'ping') {
        peer.send('pong')
        return
      }

      // Parse message if it's JSON
      let data: ChatMessage
      try {
        data = JSON.parse(messageContent)
      } catch {
        data = { 
          type: 'message',
          message: messageContent,
          timestamp: new Date().toISOString()
        }
      }

      // Validate message structure
      if (!data.message && data.type === 'message') {
        logger.error({ message: 'Invalid message format' }, peer)
        peer.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format. Please provide a message with book URLs to analyze.',
          timestamp: new Date().toISOString()
        }))
        return
      }

      // Handle different message types
      if (data.type === 'message') {
        // Send acknowledgment to the client
        peer.send(JSON.stringify({
          type: 'system',
          message: 'Book research request received. Starting analysis...',
          timestamp: new Date().toISOString()
        }))

        // Process the research request
     
      } else if (data.type === 'human_feedback' && data.feedback) {
        // Store human feedback for the agent to pick up
       
        
        // Send acknowledgment
        peer.send(JSON.stringify({
          type: 'system',
          message: 'Feedback received, continuing with research',
          timestamp: new Date().toISOString()
        }))
      }

    } catch (error) {
      logger.error({ message: 'Error in message handler', error: error as Error }, peer)
      peer.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process book research request',
        timestamp: new Date().toISOString()
      }))
    }
  }
})

function getRoomId(peer: Peer): string {
  const url = peer.request?.url || ''
  const query = getQuery(url)
  const room = query.room
  return typeof room === 'string' ? room : (Array.isArray(room) ? room[0] : 'BOOK_RESEARCH')
}

function getStats() {
  return {
    online: users.size,
    total: users.size
  }
}
