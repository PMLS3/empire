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
  text: string
}

interface ScreenShareAttachment extends BaseAttachment {
  type: 'screenshare'
  stream: MediaStream
  thumbnail?: string
  text: string
}

type MessageAttachment = LinkAttachment | ImageAttachment | VoiceAttachment | VideoAttachment | ScreenShareAttachment

interface ChatMessage {
  type: 'sent' | 'received' | 'separator'
  text: string
  time: string
  attachments: MessageAttachment[]
}

interface ChatUser {
  name: string
  photo: string
  role: string
  bio: string
  age: number
  location: string
}

interface Conversation {
  id: number
  user: ChatUser
  messages: ChatMessage[]
}

import { useChatGemini } from './useChatGemini'
import { useChatAgency } from './useChatAgency'
import { useRuntimeConfig } from '#app'
import { ref, shallowRef, computed, watch } from 'vue'

export const useChat = () => {
  const config = useRuntimeConfig()
  const geminiChat = useChatGemini({ apiKey: config.public.geminiApiKey, stateKey: 'main-chat' })
  
  // Initialize agency chats with unique configuration to ensure they don't share state
  const crmAgency = useChatAgency({
    apiKey: config.public.geminiApiKey,
    functionGroups: ['crm', 'research'],
    customInstructions: 'Focus on helping with customer relationship management. You are a CRM Assistant.',
    enableVoice: true,
    enableScreenShare: false
  })

  const researchAgency = useChatAgency({
    apiKey: config.public.geminiApiKey,
    functionGroups: ['research'], // Fixed: was duplicating 'research' twice
    customInstructions: 'Focus on helping with research tasks. You are a Research Assistant.',
    enableVoice: true,
    enableScreenShare: false
  })
  
  const publishingAgency = useChatAgency({
    serverBased: true,
    serverUrl: config.public.publishingAgencyUrl || '/api/chat/test',
    functionGroups: ['publishing', 'research'],
    customInstructions: 'Focus on helping with book publishing projects. You are a Publishing Assistant.',
    enableVoice: true,
    enableScreenShare: true
  })
  
  const {
    openGeminiConnection,
    sendMessage: sendGeminiMessage,
    sendVoiceMessage: sendGeminiVoice,
    messages: geminiMessages,
    voiceMessages: geminiVoiceMessages,
    isVoiceStreaming,
    isConnected,
    startVoiceRecording,
    sendContextInfo
  } = geminiChat

  // Agency integration - create a mapping of conversation roles to agency instances
  const agencyChats = {
    'crm-agency': crmAgency,
    'publishing-agency': publishingAgency,
    'research-agency': researchAgency,
  }

  // Use useState for all state that needs to persist
  const message = useState('message', () => '')
  const messageLoading = useState('messageLoading', () => false)
  const activeConversationId = useState<number | null>('activeConversationId', () => null)
  const mobileOpen = useState('mobileOpen', () => false)
  const expanded = useState('expanded', () => false)
  const loading = useState('loading', () => false)
  const chatEl = ref<HTMLElement | null>(null)
  const searchMessages = useState('searchMessages', () => '')
  const selectedOption = useState('selectedOption', () => 'chat')
  const readText = useState('readText', () => false)
  const isSpeaking = ref(false)
  const speechQueue = ref<string[]>([])

  const toggleReadText = () => {
    readText.value = !readText.value
    if (!readText.value) {
      stopSpeaking()
    }
  }

  // Use useState for conversations
  const conversations = useState<Conversation[]>('conversations', () => [
    {
      id: 6,
      user: {
        name: 'Gemini',
        photo: '/img/avatars/1.svg',
        role: 'gemini',
        bio: 'I am Gemini, an AI assistant powered by Google\'s advanced language model.',
        age: 1,
        location: 'Mountain View, CA',
      },
      messages: [],
    },
    {
      id: 1,
      user: {
        name: 'CRM Assistant',
        photo: '/img/avatars/3.svg',
        role: 'crm-agency',
        bio: 'I am your CRM assistant helping you manage customer relationships efficiently.',
        age: 1,
        location: 'Agency Cloud',
      },
      messages: [],
    },
    {
      id: 2,
      user: {
        name: 'Publishing Assistant',
        photo: '/img/avatars/4.svg',
        role: 'publishing-agency',
        bio: 'I am your publishing assistant helping with book projects and market analysis.',
        age: 1,
        location: 'Agency Cloud',
      },
      messages: [],
    },
    {
      id: 3,
      user: {
        name: 'Research Assistant',
        photo: '/img/avatars/3.svg',
        role: 'research-agency',
        bio: 'I am your Research assistant helping you manage customer relationships efficiently.',
        age: 1,
        location: 'Agency Cloud',
      },
      messages: [],
    },



  ])

  const selectedConversation = computed(() => {
    const conv = conversations.value.find(c => c.id === activeConversationId.value)
    return conv
  })

  // Watch for Gemini messages and update conversation
  watch(geminiMessages, (newMessages) => {
    // console.log('Gemini messages updated:', newMessages)
    if (selectedConversation.value?.user.role === 'gemini') {
      // console.log('Updating Gemini conversation messages')
      const conversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (conversation) {
        // Update conversation messages
        conversation.messages = newMessages
      }
    }
  }, { deep: true })

  // Watch for Gemini voice messages and update conversation
  watch(geminiVoiceMessages, (newMessages) => {
    console.log('Gemini voice messages updated:', newMessages)
    if (selectedConversation.value?.user.role === 'gemini') {
      console.log('Updating Gemini conversation with voice messages')
      const conversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (conversation) {
        // Merge text and voice messages, maintaining chronological order
        const allMessages = [...conversation.messages, ...newMessages]
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        conversation.messages = allMessages
      }
    }
  }, { deep: true })

  // Watch for Gemini messages and update conversation
  watch(geminiMessages, (newMessages) => {
    if (selectedConversation.value?.user.role === 'gemini') {
      const conversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (conversation) {
        // Get the latest message
        const latestMessage = newMessages[newMessages.length - 1]

        // If it's a received message and text-to-speech is enabled, speak it
        if (latestMessage?.type === 'received' && readText.value) {
          speakText(latestMessage.text)
        }

        conversation.messages = newMessages
      }
    }
  }, { deep: true })

  // Watch for Agency messages and update conversations
  // Create a watcher for each agency with the correct reference handling
  Object.entries(agencyChats).forEach(([role, agency]) => {
    watch(() => agency.messages, (newMessages) => {
      try {
        console.log(`${role} messages updated:`, newMessages);
        
        if (selectedConversation.value?.user.role === role) {
          const conversation = conversations.value.find(c => c.id === activeConversationId.value);
          if (conversation && Array.isArray(newMessages)) {
            // Format the messages to match ChatMessage format if needed
            const formattedMessages = newMessages.map(msg => {
              try {
                // Skip null or undefined messages
                if (!msg) return null;
                
                // Check if the message already has the required format
                if (msg.type && (msg.text || msg.content)) {
                  return {
                    ...msg,
                    text: msg.text || msg.content,
                    attachments: msg.attachments || []
                  };
                }
                
                // Convert from Gemini message format if necessary
                return {
                  type: msg.role === 'user' ? 'sent' : 'received',
                  text: msg.content || (msg.parts && Array.isArray(msg.parts) ? msg.parts.join('') : '') || '',
                  time: msg.time || new Date().toLocaleTimeString(),
                  attachments: []
                };
              } catch (err) {
                console.error('Error formatting message:', err, msg);
                return null;
              }
            }).filter(Boolean); // Remove any null messages
            
            // Get the latest message for text-to-speech
            const latestMessage = formattedMessages[formattedMessages.length - 1];

            // If it's a received message and text-to-speech is enabled, speak it
            if (latestMessage && 
                (latestMessage.type === 'received' || latestMessage.role === 'assistant') && 
                readText.value) {
              const textToSpeak = latestMessage.text || latestMessage.content || '';
              if (textToSpeak) speakText(textToSpeak);
            }

            // Update conversation messages with a completely new array to ensure reactivity
            conversation.messages = [...formattedMessages];
          }
        }
      } catch (err) {
        console.error(`Error processing ${role} messages:`, err);
      }
    }, { deep: true, immediate: false }); // Remove immediate to avoid initial empty messages overwrite
  });

  // Watch for Agency messages and update conversations
  Object.entries(agencyChats).forEach(([role, agency]) => {
    watch(() => agency.messages, (newMessages) => {
      try {
        console.log(`${role} messages updated:`, newMessages);
        
        if (selectedConversation.value?.user.role === role) {
          const conversation = conversations.value.find(c => c.id === activeConversationId.value);
          if (conversation && Array.isArray(newMessages)) {
            // Format the messages to match ChatMessage format
            const formattedMessages = newMessages.map(msg => {
              try {
                // Skip null or undefined messages
                if (!msg) return null;
                
                // Handle special message types
                if (msg.type === 'error') {
                  return {
                    type: 'received',
                    text: `Error: ${msg.text || msg.content || 'An error occurred'}`,
                    time: msg.time || new Date().toLocaleTimeString(),
                    attachments: [],
                    error: true
                  };
                }
                
                if (msg.type === 'system') {
                  return {
                    type: 'separator',
                    text: msg.text || msg.content || '',
                    time: msg.time || new Date().toLocaleTimeString(),
                    attachments: []
                  };
                }
                
                // Check if the message already has the required format
                if (msg.type && (msg.text || msg.content)) {
                  return {
                    ...msg,
                    text: msg.text || msg.content || '',
                    attachments: msg.attachments || []
                  };
                }
                
                // Convert from other formats if necessary
                return {
                  type: msg.role === 'user' ? 'sent' : 'received',
                  text: msg.content || (msg.parts && Array.isArray(msg.parts) ? msg.parts.join('') : '') || '',
                  time: msg.time || new Date().toLocaleTimeString(),
                  attachments: []
                };
              } catch (err) {
                console.error('Error formatting message:', err, msg);
                return null;
              }
            }).filter(Boolean); // Remove any null messages
            
            // Get the latest message for text-to-speech
            const latestMessage = formattedMessages[formattedMessages.length - 1];

            // If it's a received message and text-to-speech is enabled, speak it
            if (latestMessage && 
                (latestMessage.type === 'received') && 
                readText.value) {
              const textToSpeak = latestMessage.text || '';
              if (textToSpeak) speakText(textToSpeak);
            }

            // Update conversation messages
            conversation.messages = [...formattedMessages];
          }
        }
      } catch (err) {
        console.error(`Error processing ${role} messages:`, err);
      }
    }, { deep: true });
  });

  // Watch for Agency messages and update conversations
  Object.entries(agencyChats).forEach(([role, agency]) => {
    watch(() => agency.messages.value, (newMessages) => {
      try {
        console.log(`${role} messages updated:`, newMessages);
        
        if (selectedConversation.value?.user.role === role) {
          const conversation = conversations.value.find(c => c.id === activeConversationId.value);
          if (conversation && Array.isArray(newMessages)) {
            // Format the messages to match ChatMessage format
            const formattedMessages = newMessages.map(msg => {
              try {
                // Skip null or undefined messages
                if (!msg) return null;
                
                // Handle Gemini serverContent format
                if (msg.serverContent) {
                  const modelTurn = msg.serverContent.modelTurn;
                  if (modelTurn && modelTurn.parts && modelTurn.parts.length > 0) {
                    const text = modelTurn.parts.map((part: any) => part.text || '').join('');
                    return {
                      type: 'received',
                      text: text,
                      time: new Date().toLocaleTimeString(),
                      attachments: []
                    };
                  }
                  // Skip turnComplete notifications
                  if (msg.serverContent.turnComplete) return null;
                }
                
                // Handle special message types
                if (msg.type === 'error') {
                  return {
                    type: 'received',
                    text: `Error: ${msg.text || msg.content || 'An error occurred'}`,
                    time: msg.time || new Date().toLocaleTimeString(),
                    attachments: [],
                    error: true
                  };
                }
                
                if (msg.type === 'system') {
                  return {
                    type: 'separator',
                    text: msg.text || msg.content || '',
                    time: msg.time || new Date().toLocaleTimeString(),
                    attachments: []
                  };
                }
                
                // Check if the message already has the required format
                if (msg.type && (msg.text || msg.content)) {
                  return {
                    ...msg,
                    text: msg.text || msg.content || '',
                    attachments: msg.attachments || []
                  };
                }
                
                // Convert from other formats if necessary
                return {
                  type: msg.role === 'user' ? 'sent' : 'received',
                  text: msg.content || (msg.parts && Array.isArray(msg.parts) ? msg.parts.join('') : '') || '',
                  time: msg.time || new Date().toLocaleTimeString(),
                  attachments: []
                };
              } catch (err) {
                console.error('Error formatting message:', err, msg);
                return null;
              }
            }).filter(Boolean); // Remove any null messages
            
            // Only update if there are new messages to show
            if (formattedMessages.length > 0) {
              // Get the latest message for text-to-speech
              const latestMessage = formattedMessages[formattedMessages.length - 1];
              
              // If it's a received message and text-to-speech is enabled, speak it
              if (latestMessage && latestMessage.type === 'received' && readText.value) {
                const textToSpeak = latestMessage.text || '';
                if (textToSpeak) speakText(textToSpeak);
              }
              
              // Update conversation messages ensuring reactivity with a new array
              conversation.messages = [...formattedMessages];
            }
          }
        }
      } catch (err) {
        console.error(`Error processing ${role} messages:`, err);
      }
    }, { deep: true });
  });

  // Initialize connection when selecting a conversation
  const selectConversation = async (id: number) => {
    console.log('Selecting conversation:', id)
    activeConversationId.value = id
    const conversation = conversations.value.find(c => c.id === id)
    console.log('Found conversation:', conversation)

    if (conversation) {
      try {
        if (conversation.user.role === 'gemini') {
          console.log('Opening Gemini connection')
          await openGeminiConnection()
          console.log('Gemini connection established')
        } else if (conversation.user.role in agencyChats) {
          console.log(`Opening ${conversation.user.role} connection`);
          const agency = agencyChats[conversation.user.role];
          
          // Initialize the agency connection if it has an initConnection method
          if (typeof agency.initConnection === 'function') {
            console.log(`Initializing agency connection for ${conversation.user.role}`);
            await agency.initConnection();
            console.log(`Agency connection initialized, status:`, agency.isConnected.value);
          }
          
          // Get messages from the agency
          const agencyMessages = agency.messages.value;
          
          // Only update if there are messages to show and the conversation is empty
          if (Array.isArray(agencyMessages) && agencyMessages.length > 0 && 
              (!conversation.messages || conversation.messages.length === 0)) {
            try {
              const formattedMessages = agencyMessages.map(msg => {
                // Skip null or undefined messages
                if (!msg) return null;
                
                // Check if the message already has the required format
                if (msg.type && msg.time) {
                  return {
                    ...msg,
                    attachments: msg.attachments || []
                  };
                }
                
                // Convert from Gemini message format if necessary
                return {
                  type: msg.role === 'user' ? 'sent' : 'received',
                  text: msg.content || (msg.parts && Array.isArray(msg.parts) ? msg.parts.join('') : '') || '',
                  time: new Date().toLocaleTimeString(),
                  attachments: []
                };
              }).filter(Boolean); // Remove any null messages
              
              // Initialize with formatted messages
              conversation.messages = formattedMessages;
            } catch (err) {
              console.error('Error formatting messages on conversation select:', err);
              // Initialize with empty messages if formatting fails
              conversation.messages = [];
            }
          }
          
          console.log(`${conversation.user.role} connection established`)
        }
      } catch (error) {
        console.error('Failed to initialize connection:', error)
      }
    }
  }

  // Handle message submission
  const submitMessage = async ({ text, image }: { text?: string; image?: string } = {}) => {
    console.log('Selected conversation:', selectedConversation.value)
    console.log('Message loading:', messageLoading.value)
    console.log('Active conversation ID:', activeConversationId.value)

    if (!selectedConversation.value || messageLoading.value) {
      return
    }

    const messageText = text || message.value?.trim()
    if (!messageText && !image) {
      return
    }

    message.value = ''
    messageLoading.value = true

    try {
      const attachments: MessageAttachment[] = []
      if (image) {
        attachments.push({
          type: 'image',
          image,
          text: 'Image attachment'
        })
      }

      // Send the message to the appropriate service
      if (selectedConversation.value.user.role === 'gemini') {
        console.log('Sending message to Gemini:', messageText)
        await sendGeminiMessage(messageText, image)
      } else if (selectedConversation.value.user.role in agencyChats) {
        console.log(`Sending message to ${selectedConversation.value.user.role}:`, messageText);
        const agency = agencyChats[selectedConversation.value.user.role];
        
        // Create the user message
        const userMessage = {
          type: 'sent',
          text: messageText,
          time: new Date().toLocaleTimeString(),
          attachments: attachments || [],
        };
        
        // Add message to UI immediately for responsiveness
        selectedConversation.value.messages = [
          ...selectedConversation.value.messages, 
          userMessage
        ];
        
        try {
          // Ensure connection is established before sending
          if (typeof agency.initConnection === 'function' && !agency.isConnected.value) {
            console.log(`Initializing connection for ${selectedConversation.value.user.role} before sending message`);
            await agency.initConnection();
          }
          
          // Send the message through the agency
          await agency.sendMessage(messageText);
          console.log(`Message sent to ${selectedConversation.value.user.role} successfully`);
        } catch (error) {
          console.error(`Error sending message to ${selectedConversation.value.user.role}:`, error);
          
          // Add error message to conversation
          selectedConversation.value.messages.push({
            type: 'received',
            text: `Error: ${error.message || 'Connection failed'}`,
            time: new Date().toLocaleTimeString(),
            attachments: [],
            error: true
          });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      messageLoading.value = false
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = (event) => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:video/webm;base64,")
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!selectedConversation.value) return

    try {
      // Create a temporary message showing that we're transcribing
      const tempMessage: ChatMessage = {
        type: 'sent',
        text: '🎤 Transcribing voice message...',
        time: new Date().toLocaleTimeString(),
        attachments: [{
          type: 'voice',
          audio: URL.createObjectURL(audioBlob),
        }],
      }

      // Add temporary message to conversation
      if (selectedConversation.value) {
        selectedConversation.value.messages.push(tempMessage)
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported')
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      // Create a promise to handle the transcription
      const transcriptionPromise = new Promise<string>((resolve, reject) => {
        let finalTranscript = ''

        recognition.onstart = () => {
          console.log('Speech recognition started')
        }

        recognition.onresult = (event) => {
          console.log('Speech recognition result:', event)
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
              console.log('Final transcript:', finalTranscript)
            } else {
              interimTranscript += transcript
              console.log('Interim transcript:', interimTranscript)
            }
          }

          // Update temporary message with current transcription
          if (selectedConversation.value) {
            const messageIndex = selectedConversation.value.messages.indexOf(tempMessage)
            if (messageIndex !== -1) {
              const updatedMessage = {
                ...tempMessage,
                text: `🎤 ${interimTranscript || finalTranscript}`.trim(),
              }
              selectedConversation.value.messages.splice(messageIndex, 1, updatedMessage)
            }
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          reject(event.error)
        }

        recognition.onend = () => {
          console.log('Speech recognition ended')
          if (finalTranscript) {
            resolve(finalTranscript.trim())
          } else {
            reject('No speech detected')
          }
        }
      })

      // Convert audio blob to audio element and play it
      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.onended = () => {
        recognition.stop()
      }

      // Start recognition and play audio
      recognition.start()
      await audio.play()

      try {
        const transcription = await transcriptionPromise
        console.log('Final transcription:', transcription)

        // Update conversation with final transcription
        if (selectedConversation.value) {
          // Remove temporary message
          selectedConversation.value.messages = selectedConversation.value.messages
            .filter(msg => msg !== tempMessage)

          // Add final message
          const finalMessage: ChatMessage = {
            type: 'sent',
            text: transcription,
            time: new Date().toLocaleTimeString(),
            attachments: [{
              type: 'voice',
              audio: URL.createObjectURL(audioBlob),
            }],
          }
          selectedConversation.value.messages.push(finalMessage)

          // Send to appropriate service
          if (selectedConversation.value.user.role === 'gemini') {
            await sendGeminiMessage(transcription)
            await sendGeminiVoice(audioBlob)
          } else if (selectedConversation.value.user.role in agencyChats) {
            const agency = agencyChats[selectedConversation.value.user.role]
            if (agency.startRecording && agency.stopRecording) {
              // Use the agency's voice capabilities directly
              await agency.sendMessage(transcription)
            } else {
              // Fallback to text-only if voice not supported
              await agency.sendMessage(transcription)
            }
          }
        }
      } catch (transcriptionError) {
        console.error('Transcription error:', transcriptionError)
        throw transcriptionError
      }

    } catch (error) {
      console.error('Voice message error:', error)

      if (selectedConversation.value) {
        // Remove temporary message if it exists
        selectedConversation.value.messages = selectedConversation.value.messages
          .filter(msg => msg !== tempMessage)

        // Add error message
        selectedConversation.value.messages.push({
          type: 'sent',
          text: '❌ Failed to process voice message',
          time: new Date().toLocaleTimeString(),
          attachments: [{
            type: 'voice',
            audio: URL.createObjectURL(audioBlob),
          }],
        })
      }
    }
  }

  const sendVideoMessage = async (videoBlob: Blob, thumbnail?: string, duration?: number) => {
    if (!selectedConversation.value) return

    const videoUrl = URL.createObjectURL(videoBlob)

    selectedConversation.value.messages.push({
      type: 'sent',
      text: '🎥 Video message',
      time: new Date().toLocaleTimeString(),
      attachments: [{
        type: 'video',
        video: videoUrl,
        thumbnail,
        duration,
        text: `Video message (${duration}s)`,
      }],
    })

    if (selectedConversation.value.user.role === 'gemini') {
      await sendGeminiMessage('') // This will establish the connection
      // const videoBase64 = await blobToBase64(videoBlob)
      // await sendGeminiVideo(videoBase64, '🎥 Video message')
    }
  }

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      console.error('[speakText] Speech synthesis not supported')
      return
    }

    // Add text to queue
    speechQueue.value.push(text)

    // If already speaking, return and let the queue handle it
    if (isSpeaking.value) {
      return
    }

    const processQueue = () => {
      // If queue is empty or speech is disabled, stop processing
      if (speechQueue.value.length === 0 || !readText.value) {
        isSpeaking.value = false
        return
      }

      isSpeaking.value = true
      const textToSpeak = speechQueue.value[0]
      const utterance = new SpeechSynthesisUtterance(textToSpeak)

      // Configure speech settings
      utterance.rate = 0.9  // Slightly slower for better quality
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Set up voices
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice =>
        voice.lang === 'en-US' && voice.name.includes('Google')
      ) || voices.find(voice =>
        voice.lang === 'en-US'
      ) || voices.find(voice =>
        voice.lang.startsWith('en')
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // Keep speech going
      const resumeSpeaking = () => {
        if (isSpeaking.value) {
          window.speechSynthesis.resume()
          setTimeout(resumeSpeaking, 250)
        }
      }

      utterance.onstart = () => {
        resumeSpeaking()
      }

      utterance.onend = () => {
        isSpeaking.value = false
        speechQueue.value.shift()
        processQueue()
      }

      utterance.onerror = () => {
        isSpeaking.value = false
        speechQueue.value.shift()
        processQueue()
      }

      // Speak the text
      window.speechSynthesis.cancel() // Clear any previous speech
      window.speechSynthesis.speak(utterance)
    }

    // Start processing if not already speaking
    if (!isSpeaking.value) {
      processQueue()
    }
  }

  const stopSpeaking = () => {
    isSpeaking.value = false
    window.speechSynthesis.cancel()
    speechQueue.value = []
  }

  const sendContextMessage = async (text: string) => {
    if (!selectedConversation.value) return

    try {
      // Create a temporary message showing that we're executing a function
      const tempMessage: ChatMessage = {
        type: 'sent',
        text: `Executing function: ${text}`,
        time: new Date().toLocaleTimeString(),
        attachments: [],
      }

      // Add temporary message to conversation
      if (selectedConversation.value) {
        selectedConversation.value.messages.push(tempMessage)
      }

      // Send the function call to the appropriate service
      if (selectedConversation.value.user.role === 'gemini') {
        await sendContextInfo(text)
      } else if (selectedConversation.value.user.role in agencyChats) {
        // For agencies, just send as a regular message
        // The function handling is done automatically via function groups
        await agencyChats[selectedConversation.value.user.role].sendMessage(text)
      }
    } catch (error) {
      console.error('Failed to send function message:', error)
    }
  }
  

  return {
    message,
    messageLoading,
    conversations,
    activeConversationId,
    selectedConversation,
    mobileOpen,
    expanded,
    loading,
    chatEl,
    searchMessages,
    selectedOption,
    readText,
    toggleReadText,
    selectConversation,
    sendVoiceMessage,
    sendVideoMessage,
    submitMessage,
    stopSpeaking,
    sendContextMessage,
    isSpeaking: computed(() => isSpeaking.value)
  }
}
