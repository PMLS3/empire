import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useChatGemini } from './useChatGemini'
import { useVoiceRecorder } from './media/useVoiceRecorder'
import { useAudioPlayer } from './media/useAudioPlayer'
import { useVideo } from './media/useVideo'
import { functionGroups, combineGroups } from '../../functions'

export interface ChatAgencyOptions {
  // Connection options
  serverBased?: boolean
  apiKey?: string
  serverUrl?: string
  
  // Agency configuration
  functionGroups: string[]
  customInstructions?: string
  
  // Voice and media options
  enableVoice?: boolean
  enableScreenShare?: boolean
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  time?: string;
}

export interface ChatAgencyState {
  messages: Ref<ChatMessage[]>
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useChatAgency(options: ChatAgencyOptions) {
  // Create independent state for each agency instance
  const messages = ref<any[]>([])
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // Generate a unique ID for this agency instance
  const agencyId = `agency-${Math.random().toString(36).substring(2, 15)}`
  
  // Use combineGroups instead of manually combining function groups
  const combinedGroups = computed(() => {
    return combineGroups(options.functionGroups);
  });
  
  // Combined system instruction
  const systemInstruction = computed(() => {
    let instruction = combinedGroups.value.systemInstruction;
    if (options.customInstructions) {
      instruction += '\n\n' + options.customInstructions;
    }
    return instruction;
  });
  
  // Initialize voice capabilities if enabled
  const voiceRecorder = options.enableVoice ? useVoiceRecorder() : null
  const audioPlayer = options.enableVoice ? useAudioPlayer() : null
  
  // Initialize screen sharing if enabled
  const videoShare = options.enableScreenShare ? useVideo() : null
  
  // Connection and message handling will differ based on connection mode
  let sendMessage: (content: string) => Promise<void>
  let sendVoice: ((audioBlob: Blob) => Promise<void>) | null = null
  let sendScreen: ((imageData: string) => Promise<void>) | null = null
  // Define initConnection at this scope level so it's available for both branches
  let initConnection: () => Promise<boolean>
  
  // Helper function to generate unique message IDs
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  if (options.serverBased) {
    // Server-based implementation using WebSocket
    if (!options.serverUrl) {
      throw new Error('Server URL is required for server-based agencies')
    }
    
    const { data, status, send, open, close } = useWebSocket(options.serverUrl)
    
    // Track connection status
    watch(status, (newStatus) => {
      console.log('WebSocket status:', newStatus)
      // Check status by string comparison
      if (newStatus === 'OPEN') {
        console.log('Setting isConnected to true because status is OPEN')
        isConnected.value = true
      } else if (newStatus === 'CLOSED' || newStatus === 'CONNECTING') {
        console.log('Setting isConnected to false because status is', newStatus)
        isConnected.value = false
      }
    })
    
    // Handle incoming messages
    watch(data, (newData) => {
      if (!newData) return
      
      try {
        const message = typeof newData === 'string' ? JSON.parse(newData) : newData
        console.log('Received WebSocket message:', message)

        // Handle different message types
        switch (message.type) {
          case 'error':
            error.value = new Error(message.message || 'Unknown error')
            messages.value = [...messages.value, {
              id: generateId(),
              role: 'assistant',
              content: message.message,
              type: 'error',
              text: message.message,
              time: new Date(message.timestamp || new Date()).toLocaleTimeString()
            }];
            break;
            
          case 'system':
            messages.value = [...messages.value, {
              id: generateId(),
              role: 'system',
              content: message.message,
              type: 'system',
              text: message.message,
              time: new Date(message.timestamp || new Date()).toLocaleTimeString()
            }];
            break;
            
          case 'state_update':
            // Just log state updates without adding them to messages
            console.log('State update received:', message.state);
            break;
            
          case 'function_call':
            // Handle function calls from the server
            const { functionName, args } = message.functionCall || {}
            
            if (combinedGroups.value.handlers[functionName]) {
              isLoading.value = true
              
              combinedGroups.value.handlers[functionName](args)
                .then(result => {
                  send(JSON.stringify({
                    type: 'function_result',
                    functionName,
                    result
                  }))
                })
                .catch(err => {
                  send(JSON.stringify({
                    type: 'function_error',
                    functionName,
                    error: err.message
                  }))
                })
                .finally(() => {
                  isLoading.value = false
                })
            }
            break;
            
          case 'human_feedback_request':
            messages.value = [...messages.value, {
              id: generateId(),
              role: 'assistant',
              content: `${message.message}\n\n${message.data || ''}`,
              type: 'system',
              text: `${message.message}\n\n${message.data || ''}`,
              time: new Date(message.timestamp || new Date()).toLocaleTimeString(),
              metadata: { requiresFeedback: true }
            }];
            break;
            
          case 'message':
            if (message.message) {
              // Handle structured message object format
              messages.value = [...messages.value, {
                ...message.message,
                id: message.message.id || generateId(),
                type: message.message.type || (message.message.role === 'user' ? 'sent' : 'received'),
                text: message.message.text || message.message.content,
                time: message.message.time || new Date().toLocaleTimeString()
              }];
            }
            break;
            
          case 'assistant':
          default:
            // Handle simple message format
            messages.value = [...messages.value, {
              id: generateId(),
              role: 'assistant',
              content: message.message || message.content || '',
              type: 'received',
              text: message.message || message.content || '',
              time: new Date(message.timestamp || new Date()).toLocaleTimeString()
            }];
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err, newData)
        error.value = new Error('Failed to parse server message')
      }
    })
    
    // Initialize WebSocket connection
    initConnection = async () => {
      try {
        console.log('Initializing server-based connection');
        await open()
        
        // Send initialization data
        send(JSON.stringify({
          type: 'init',
          functionGroups: options.functionGroups,
          systemInstruction: systemInstruction.value
        }))
        
        return true;
      } catch (err) {
        error.value = new Error('Failed to connect to server')
        console.error('WebSocket connection error:', err)
        return false;
      }
    }
    
    // Attempt automatic reconnection if connection is lost
    const attemptReconnect = async () => {
      if (status.value === 'CLOSED') {
        console.log('Connection lost, attempting to reconnect...')
        try {
          await initConnection()
          console.log('Reconnected successfully')
        } catch (err) {
          console.error('Failed to reconnect:', err)
          // Try again after a delay
          setTimeout(attemptReconnect, 5000)
        }
      }
    }
    
    // Watch for connection status changes to attempt reconnection
    watch(status, (newStatus, oldStatus) => {
      if (oldStatus === 'OPEN' && newStatus === 'CLOSED') {
        attemptReconnect()
      }
    })
    
    // Immediately initialize the WebSocket connection
    initConnection()
    
    // Define message sending functions
    sendMessage = async (content: string) => {
      if (status.value !== 'OPEN') {
        await open()
      }
      
      const userMessage = {
        id: generateId(),
        role: 'user',
        content,
        time: new Date().toLocaleTimeString(),
        type: 'sent',
        text: content
      }
      
      // Create a new array for reactivity
      messages.value = [...messages.value, userMessage]
      
      send(JSON.stringify({
        type: 'message',
        message: userMessage
      }))
    }
    
    if (options.enableVoice) {
      sendVoice = async (audioBlob: Blob) => {
        if (status.value !== 'OPEN') {
          await open()
        }
        
        // Convert audio blob to base64
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          
          send(JSON.stringify({
            type: 'voice',
            audio: base64Audio
          }))
        }
      }
    }
    
    if (options.enableScreenShare) {
      sendScreen = async (imageData: string) => {
        if (status.value !== 'OPEN') {
          await open()
        }
        
        send(JSON.stringify({
          type: 'screen',
          image: imageData
        }))
      }
    }
  } else {
    // Gemini-based implementation
    if (!options.apiKey) {
      throw new Error('API key is required for Gemini-based agencies')
    }
    
    console.log(`Creating Gemini-based agency with ${options.functionGroups.length} function groups`);
    console.log(`Selected function groups for ${agencyId}:`, options.functionGroups);
    console.log(`Function declarations count: ${combinedGroups.value.declarations.length}`);
    
    // Pass the agency ID, functions and system instructions from combinedGroups
    const gemini = useChatGemini({
      apiKey: options.apiKey,
      functions: combinedGroups.value.declarations,
      systemInstruction: systemInstruction.value,
      stateKey: agencyId
    });
    
    // IMPORTANT: Don't directly link to gemini.messages - create our own messages store
    // Initialize with any existing messages from Gemini
    if (gemini.messages.value.length > 0) {
      messages.value = gemini.messages.value.map(msg => formatGeminiMessage(msg));
    }
    
    isConnected.value = gemini.isConnected?.value || false
    
    // Add a function to initialize the WebSocket connection for Gemini
    initConnection = async () => {
      try {
        console.log(`Initializing connection for agency ${agencyId}`);
        
        // Log the function declarations to help with debugging
        console.log(`Function declarations for ${agencyId}:`, {
          count: combinedGroups.value.declarations.length,
          names: combinedGroups.value.declarations.map(f => f.name)
        });
        
        // Add a short delay to ensure logging appears before potential errors
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const wsConnection = await gemini.openGeminiConnection();
        
        // Check connection result
        if (!wsConnection) {
          console.error(`Failed to establish WebSocket for ${agencyId}`);
          throw new Error('WebSocket connection failed');
        }
        
        // Wait for the isConnected state to be true
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 5000); // Timeout after 5 seconds
          
          const checkConnection = () => {
            if (gemini.isConnected.value) {
              clearTimeout(timeout);
              resolve(true);
            } else {
              setTimeout(checkConnection, 250); // Check every 250ms
            }
          };
          
          checkConnection();
        });
        
        isConnected.value = gemini.isConnected.value;
        console.log(`Connection initialized for agency ${agencyId}, status:`, isConnected.value);
        
        // If still not connected after waiting, throw error
        if (!isConnected.value) {
          throw new Error('Connection established but not ready');
        }
        
        return true;
      } catch (err) {
        console.error(`Failed to initialize connection for agency ${agencyId}:`, err);
        error.value = err instanceof Error ? err : new Error('Failed to connect');
        
        // Add more descriptive error to chat
        messages.value = [...messages.value, {
          role: 'system',
          content: `Connection error: ${err.message || 'Could not connect to Gemini API'}`,
          type: 'error',
          text: `Connection error: ${err.message || 'Could not connect to Gemini API'}`,
          time: new Date().toLocaleTimeString()
        }];
        
        return false;
      }
    };
    
    // Helper function to format Gemini messages properly
    const formatGeminiMessage = (msg: any) => {
      // If the message already has our format, return it
      if (msg.type && msg.text && msg.time) {
        return msg;
      }
      
      // Handle the Gemini serverContent format
      if (msg.serverContent) {
        const modelTurn = msg.serverContent.modelTurn;
        if (modelTurn && modelTurn.parts && modelTurn.parts.length > 0) {
          const text = modelTurn.parts.map((part: any) => part.text || '').join('');
          return {
            role: 'assistant',
            content: text,
            type: 'received',
            text: text,
            time: new Date().toLocaleTimeString()
          };
        } else if (msg.serverContent.turnComplete) {
          // This is just a completion notification, not a message to display
          return null;
        }
      }
      
      // Standard Gemini message format
      return {
        ...msg,
        type: msg.type || (msg.role === 'user' ? 'sent' : 'received'),
        text: msg.content || '',
        time: msg.time || new Date().toLocaleTimeString()
      };
    };
    
    // Watch for raw responses from Gemini
    watch(() => gemini.rawResponses, (newResponses) => {
      if (Array.isArray(newResponses) && newResponses.length > 0) {
        const lastResponse = newResponses[newResponses.length - 1];
        
        // Process serverContent format
        if (lastResponse.serverContent) {
          const formattedMessage = formatGeminiMessage(lastResponse);
          if (formattedMessage) {
            // Check if this message already exists in our messages array
            const exists = messages.value.some(m => 
              m.text === formattedMessage.text && 
              m.type === formattedMessage.type
            );
            
            if (!exists) {
              console.log("Adding new message from rawResponses:", formattedMessage);
              messages.value = [...messages.value, formattedMessage];
            }
          }
        }
      }
    }, { deep: true });
    
    // Watch for changes in Gemini messages and update our copy
    watch(() => gemini.messages.value, (newMessages) => {
      if (Array.isArray(newMessages)) {
        // Process each message and format it correctly
        const formattedMessages = newMessages
          .map(formatGeminiMessage)
          .filter(Boolean); // Remove nulls
        
        // Only update if there are actual changes to avoid unnecessary re-renders
        const currentMsgTexts = messages.value.map(m => m.text);
        const newMsgTexts = formattedMessages.map(m => m.text);
        
        // Check if there are changes before updating
        if (formattedMessages.length !== messages.value.length || 
            !newMsgTexts.every((text, i) => text === currentMsgTexts[i])) {
          console.log("Updating messages from Gemini:", formattedMessages);
          messages.value = formattedMessages;
        }
      }
      isLoading.value = false;
    }, { deep: true });
    
    // REMOVE the onRawEvent call that's causing errors
    // Instead, use a watcher for any streaming data property if it exists
    if (gemini.streamingContent) {
      watch(() => gemini.streamingContent.value, (newContent) => {
        if (newContent) {
          // If we have streaming content, update the last assistant message or create a new one
          const lastAssistantIndex = [...messages.value].findIndex(m => m.role === 'assistant');
          
          if (lastAssistantIndex !== -1) {
            // Update the existing assistant message
            const updatedMessages = [...messages.value];
            updatedMessages[lastAssistantIndex] = {
              ...updatedMessages[lastAssistantIndex],
              text: newContent,
              content: newContent
            };
            messages.value = updatedMessages;
          } else {
            // Create a new assistant message
            messages.value = [...messages.value, {
              role: 'assistant',
              content: newContent,
              text: newContent,
              type: 'received',
              time: new Date().toLocaleTimeString()
            }];
          }
        }
      });
    }
    
    // Function call handling for Gemini
    // Create our own handler since onFunctionCall doesn't exist
    watch(() => gemini.messages.value, (newMessages, oldMessages) => {
      // Check if there's a new message with a function call
      const newMessage = newMessages[newMessages.length - 1]
      if (newMessage?.functionCall) {
        const { name, arguments: args } = newMessage.functionCall
        
        if (combinedGroups.value.handlers[name]) {
          isLoading.value = true
          
          // Execute the function handler
          combinedGroups.value.handlers[name](args)
            .then(result => {
              // Return the result back to Gemini
              return gemini.sendMessage(JSON.stringify({ result }))
            })
            .catch(err => {
              error.value = err
              return gemini.sendMessage(JSON.stringify({ 
                error: err.message || 'An error occurred executing the function'
              }))
            })
            .finally(() => {
              isLoading.value = false
            })
        } else {
          error.value = new Error(`Function "${name}" not found in selected function groups`)
        }
      }
    }, { deep: true })
    
    // Define message sending functions
    sendMessage = async (content: string) => {
      isLoading.value = true
      try {
        // Check connection status first and establish connection if needed
        if (!isConnected.value || !gemini.isConnected.value) {
          console.log(`Connection not established for agency ${agencyId}, initializing before sending message`);
          const connectionSuccess = await initConnection();
          
          // Double check connection after attempt
          if (!connectionSuccess || !gemini.isConnected.value) {
            throw new Error('Failed to establish connection to Gemini API');
          }
        }
        
        // Format user message
        const userMessage = {
          role: 'user',
          content,
          time: new Date().toLocaleTimeString(),
          type: 'sent',
          text: content
        };
        
        // Add to our message list immediately for UI responsiveness
        // Make a copy of the existing array to ensure reactivity
        messages.value = [...messages.value, userMessage];
        
        // Send message to Gemini API
        return await gemini.sendMessage(content);
      } catch (err) {
        error.value = err instanceof Error ? err : new Error('Failed to send message');
        
        // Add error message to the chat
        messages.value = [...messages.value, {
          role: 'system',
          content: `Error: ${err.message || 'Connection failed'}`,
          type: 'error',
          text: `Error: ${err.message || 'Connection failed'}`,
          time: new Date().toLocaleTimeString()
        }];
        
        throw err;
      } finally {
        isLoading.value = false;
      }
    }
    
    if (options.enableVoice && voiceRecorder && audioPlayer) {
      sendVoice = async (audioBlob: Blob) => {
        isLoading.value = true
        try {
          // Check if transcribeAudio exists in gemini
          if (typeof gemini.transcribeAudio === 'function') {
            // Convert audio to text using Gemini
            const audioText = await gemini.transcribeAudio(audioBlob)
            
            // Send the transcribed text as a message
            return await sendMessage(audioText)
          } else {
            // Fallback - just tell the user we can't process audio
            await sendMessage("I received your audio message, but I'm unable to process audio at this time.")
            throw new Error('Audio transcription not available')
          }
        } catch (err) {
          error.value = err instanceof Error ? err : new Error('Failed to process voice message')
          throw err
        } finally {
          isLoading.value = false
        }
      }
      
      // Handle incoming messages for voice playback
      watch(() => gemini.messages.value, (newMessages, oldMessages) => {
        if (newMessages.length > oldMessages.length) {
          const latestMessage = newMessages[newMessages.length - 1]
          if (latestMessage.role === 'assistant' && latestMessage.content) {
            audioPlayer?.playTTS(latestMessage.content)
          }
        }
      }, { deep: true })
    }
    
    if (options.enableScreenShare && videoShare) {
      sendScreen = async (imageData: string) => {
        isLoading.value = true
        try {
          // Check if sendImageMessage exists in gemini
          if (typeof gemini.sendImageMessage === 'function') {
            return await gemini.sendImageMessage(imageData)
          } else {
            // Fallback - describe the image
            await sendMessage("I received a screenshot, but I'm unable to process images at this time.")
            throw new Error('Image processing not available')
          }
        } catch (err) {
          error.value = err instanceof Error ? err : new Error('Failed to send screen image')
          throw err
        } finally {
          isLoading.value = false
        }
      }
    }
  }
  
  // Voice recording handlers
  const startRecording = async () => {
    if (voiceRecorder) {
      await voiceRecorder.startRecording()
    }
  }
  
  const stopRecording = async () => {
    if (voiceRecorder && sendVoice) {
      const audioBlob: any = await voiceRecorder.stopRecording()
      if (audioBlob) {
        await sendVoice(audioBlob)
      }
    }
  }
  
  // Screen sharing handlers
  const startScreenShare = async () => {
    if (videoShare) {
      await videoShare.startCapture()
    }
  }
  
  const captureScreen = async () => {
    if (videoShare && sendScreen) {
      const frame = await videoShare.captureFrame()
      if (frame) {
        await sendScreen(frame)
      }
    }
  }
  
  const stopScreenShare = async () => {
    if (videoShare) {
      await videoShare.stopCapture()
    }
  }
  
  return {
    // State
    messages,
    isConnected,
    isLoading,
    error,
    
    // Message functions
    sendMessage,
    // Now we can return initConnection directly since it's defined in both branches
    initConnection, 
    
    // Voice functions
    startRecording: options.enableVoice ? startRecording : undefined,
    stopRecording: options.enableVoice ? stopRecording : undefined,
    
    // Screen sharing functions
    startScreenShare: options.enableScreenShare ? startScreenShare : undefined,
    captureScreen: options.enableScreenShare ? captureScreen : undefined,
    stopScreenShare: options.enableScreenShare ? stopScreenShare : undefined
  }
}
