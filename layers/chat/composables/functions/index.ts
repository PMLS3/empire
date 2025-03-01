import type { ChatMessage, MessageAttachment } from '~/types/chat'
import { retrieveUser } from './data/user'

import { screenShot } from './screen/index'
import {underStandingUpload} from './data/upload'


// import {  routingFunctions} from './routing/index'
// import { publishingFunctions } from './publising'
export interface FunctionContext {
  addMessage: (message: ChatMessage) => void
  sendFunctionResponseToGemini: (functionName: string, response: any) => Promise<void>
  callFunction: (functionName: string, args: any) => Promise<any>
}



export const functionHandlers = {
  retrieveUser: async (args: { fields?: string[] }, context: FunctionContext) => {
    try {
      const userData = await retrieveUser()

      // Create a message to show in chat
      const message: ChatMessage = {
        type: 'received',
        text: 'User Information Retrieved:',
        time: new Date().toLocaleTimeString(),
        attachments: [{
          type: 'link',
          text: 'User Information',
          url: '',
          image: ''
        }],
      }
      console.log('[functionHandlers:retrieveUser] Created message:', {
        type: message.type,
        text: message.text,
        attachmentsCount: message.attachments?.length,
        attachmentTypes: message.attachments?.map(a => a.type)
      })
      // Add message to chat
      context.addMessage(message)
      console.log('[functionHandlers:retrieveUser] Message added to context')
      // Send the data back to Gemini
      await context.sendFunctionResponseToGemini('retrieveUser', userData)
      console.log('[functionHandlers:retrieveUser] Response sent to Gemini')
    } catch (error) {
      const errorMessage: ChatMessage = {
        type: 'received',
        text: 'Error retrieving user information: ' + (error instanceof Error ? error.message : 'Unknown error'),
        time: new Date().toLocaleTimeString(),
        attachments: [],
      }
      console.log('[functionHandlers:retrieveUser] Created error message:', {
        type: errorMessage.type,
        text: errorMessage.text,
        attachmentsCount: errorMessage.attachments?.length,
        attachmentTypes: errorMessage.attachments?.map(a => a.type)
      })
      context.addMessage(errorMessage)
      console.log('[functionHandlers:retrieveUser] Error message added to context')
      await context.sendFunctionResponseToGemini('retrieveUser', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('[functionHandlers:retrieveUser] Error response sent to Gemini')
    }
  },

  screenShot: async (args: { screenshot?: string, question?: string }, context: FunctionContext) => {
    console.log('[functionHandlers:screenShot] Starting function with args:', args)
    try {
      // Add loading message
      const loadingMessage: ChatMessage = {
        type: 'received',
        text: args.question
          ? `Taking screenshot and analyzing: "${args.question}"...`
          : 'Taking screenshot and analyzing content...',
        time: new Date().toLocaleTimeString(),
        attachments: []
      }
      context.addMessage(loadingMessage)

      const result = await screenShot(args.question)
      console.log('[functionHandlers:screenShot] Screenshot result:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      // Create message with screenshot
      const message: ChatMessage = {
        type: 'received',
        text: 'Here is the screenshot:',
        time: new Date().toLocaleTimeString(),
        attachments: [{
          type: 'image',
          image: result.dataUrl,
          text: 'Screenshot of current view'
        }]
      }
      context.addMessage(message)

      // Send understanding to Gemini
      await context.sendFunctionResponseToGemini('screenShot', {
        metadata: result.metadata,
        understanding: result.understanding
      })

      return result
    } catch (error) {
      console.error('[functionHandlers:screenShot] Error:', error)
      const errorMessage: ChatMessage = {
        type: 'received',
        text: `Error taking screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        time: new Date().toLocaleTimeString(),
        attachments: []
      }
      context.addMessage(errorMessage)
      return null
    }
  },
  understandingUpload: async (args: { file: string | File }, context: FunctionContext) => {
    console.log('[functionHandlers:understandingUpload] Starting function')
    try {
      const result: any = await underStandingUpload(args.file)
      console.log('[functionHandlers:understandingUpload] Upload result:', result)

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Send the complete result to Gemini for context
      await context.sendFunctionResponseToGemini('understandingUpload', {
        file: result.metadata,
        understanding: result.understanding
      })

      console.log('[functionHandlers:understandingUpload] Response sent to Gemini')

      return result
    } catch (error) {
      console.error('[functionHandlers:understandingUpload] Error:', error)
      const errorMessage: ChatMessage = {
        type: 'received',
        text: `Error uploading understanding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        time: new Date().toLocaleTimeString(),
        attachments: []
      }
      context.addMessage(errorMessage)
      await context.sendFunctionResponseToGemini('understandingUpload', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  },
  // ...routingFunctions(),
  // ...publishingFunctions()
}

export const handleResearchResults = async (args: { results: any[], query: string }, context: FunctionContext) => {
  // Format research results into a readable message
  const formattedResults = args.results.map(result => {
    return `📚 ${result.title}\n🔗 ${result.url}\n📖 ${result.content}\n`
  }).join('\n')

  console.log('[functionHandlers:handleResearchResults] Formatted results:', formattedResults)
  // Create a message to display the results
  const message: ChatMessage = {
    type: 'received',
    text: `Here are the research results for "${args.query}":\n\n${formattedResults}`,
    time: new Date().toLocaleTimeString(),
    attachments: args.results.map(result => ({
      type: 'link',
      url: result.url,
      title: result.title
    }))
  }

  // Add the message to the chat
  context.addMessage(message)

  // Send the results back to Gemini in the format it expects
  await context.sendFunctionResponseToGemini('callAgencies', {
    type: 'research_results',
    query: args.query,
    results: args.results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score
    }))
  })

  return {
    success: true,
    message: 'Research results processed'
  }
}

Object.assign(functionHandlers, {
  handleResearchResults
})