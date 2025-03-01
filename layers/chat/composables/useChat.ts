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
import { useAgentWebCrawler } from './agents/agentWebCrawler'
import { useRuntimeConfig } from '#app'
import { ref, shallowRef, computed, watch } from 'vue'

export const useChat = () => {
  const config = useRuntimeConfig()
  const geminiChat = useChatGemini(config.public.geminiApiKey)
  const agencyChat = useChatAgency()
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

  const {
    openAgencyConnection,
    sendMessage: sendAgencyMessage,
    messages: agencyMessages
  } = agencyChat

  const {
    openWebCrawlerConnection,
    sendMessage: sendWebCrawlerMessage,
    messages: webCrawlerMessages
  } = useAgentWebCrawler()

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
      id: 1,
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
      id: 2,
      user: {
        name: 'Agency',
        photo: '/img/avatars/3.svg',
        role: 'agency',
        bio: 'Kaleb is a family member registered under the same account.',
        age: 32,
        location: 'New York',
      },
      messages: [

      ],
    },
    {
      id: 3,
      user: {
        name: 'Web Crawler',
        photo: '/img/avatars/4.svg',
        role: 'web-crawler',
        bio: 'I am a web crawler registered under the same account.',
        age: 32,
        location: 'New York',
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

  // Watch for Agency messages
  watch(agencyMessages, (newMessages) => {
    console.log('Agency messages updated:', newMessages)
    if (selectedConversation.value?.user.role === 'agency') {
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

  // Watch for Web Crawler messages
  watch(webCrawlerMessages, (newMessages) => {
    if (selectedConversation.value?.user.role === 'web-crawler') {
      const conversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (conversation) {
        conversation.messages = newMessages
      }
    }
  }, { deep: true })


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
      } else if (selectedConversation.value.user.role === 'agency') {
        console.log('Sending message to Agency:', messageText)
        console.log('Agency connection status:', {
          isConnected: agencyChat.isConnected.value
        })
        selectedConversation.value.messages.push({
          type: 'sent',
          text: messageText,
          time: new Date().toLocaleTimeString(),
          attachments,
        })
        try {
          await sendAgencyMessage(messageText)
          console.log('Message sent to Agency successfully')
        } catch (error) {
          console.error('Error sending message to Agency:', error)
          // Try reconnecting and sending again
          console.log('Attempting to reconnect to Agency...')
          await openAgencyConnection()
          console.log('Reconnected to Agency, trying to send message again...')
          await sendAgencyMessage(messageText)
        }
      } else if (selectedConversation.value.user.role === 'web-crawler') {
        console.log('Sending message to Web Crawler:', messageText)
        await sendWebCrawlerMessage(messageText, image)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      messageLoading.value = false
    }
  }

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

        } else if (conversation.user.role === 'agency') {
          console.log('Opening Agency connection')
          await openAgencyConnection()
          console.log('Agency connection established')
        } else if (conversation.user.role === 'web-crawler') {
          console.log('Opening Web Crawler connection')
          await openWebCrawlerConnection()
          console.log('Web Crawler connection established')
        }
      } catch (error) {
        console.error('Failed to initialize connection:', error)
      }
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
          } else {
            await sendAgencyMessage(transcription)
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

      // Send the function call to Gemini
      if (selectedConversation.value.user.role === 'gemini') {  
        await sendContextInfo(text)
      } else if (selectedConversation.value.user.role === 'agency') {
        // await sendAgencyMessage(text)
      } else if (selectedConversation.value.user.role === 'web-crawler') {
        // await sendWebCrawlerMessage(text)
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
