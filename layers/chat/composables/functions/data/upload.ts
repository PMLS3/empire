import { useRuntimeConfig } from '#imports'
import { useChat } from '../../useChat'

// Helper to convert base64 to File object
const base64ToFile = async (base64String: string, filename = 'screenshot.png'): Promise<{ file: Blob, data: Uint8Array }> => {
  console.log('[base64ToFile] Starting conversion')
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
    console.log('[base64ToFile] Base64 length:', base64Data.length)
    
    const byteCharacters = atob(base64Data)
    console.log('[base64ToFile] Decoded byte length:', byteCharacters.length)
    
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    console.log('[base64ToFile] Created byte array of length:', byteArray.length)
    
    const blob = new Blob([byteArray], { type: 'image/png' })
    console.log('[base64ToFile] Created blob:', {
      size: blob.size,
      type: blob.type
    })

    return { file: blob, data: byteArray }
  } catch (error) {
    console.error('[base64ToFile] Error converting base64 to file:', error)
    throw error
  }
}

export const underStandingUpload = async (input: File | string, options: { 
  skipMessages?: boolean,
  question?: string 
} = {}) => {
  console.log('[understandingUpload] Starting upload with input type:', typeof input)
  try {
    let fileData: Uint8Array | string
    let fileType: string
    let fileName: string
    let preview: string | undefined

    if (typeof input === 'string') {
      console.log('[understandingUpload] Processing base64 data')
      // Check if it's a data URL
      if (input.startsWith('data:')) {
        const matches = input.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
          throw new Error('Invalid data URL format')
        }
        fileType = matches[1]
        fileData = matches[2] // Keep base64 string for direct upload
      } else {
        // Assume it's just base64
        fileType = 'image/jpeg'
        fileData = input
      }
      fileName = 'image.' + fileType.split('/')[1]
      preview = input
    } else {
      console.log('[understandingUpload] Reading file data')
      fileData = new Uint8Array(await input.arrayBuffer())
      fileType = input.type
      fileName = input.name
      if (input.type.startsWith('image/')) {
        preview = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            console.log('[understandingUpload] Preview created')
            resolve(reader.result as string)
          }
          reader.onerror = (error) => {
            console.error('[understandingUpload] Error creating preview:', error)
            resolve(undefined)
          }
          reader.readAsDataURL(input)
        })
      }
    }

    console.log('[understandingUpload] File details:', {
      name: fileName,
      type: fileType,
      size: typeof fileData === 'string' ? fileData.length : fileData.length
    })

    // Create form data
    const formData = new FormData()
    if (typeof fileData === 'string') {
      // For base64 data, create a Blob from the base64 string
      const binary = atob(fileData)
      const array = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i)
      }
      formData.append('file', new Blob([array], { type: fileType }), fileName)
    } else {
      formData.append('file', new Blob([fileData], { type: fileType }), fileName)
    }
    formData.append('projectId', '')  // Will use default from config
    formData.append('location', '')   // Will use default
    formData.append('model', '')      // Will use default
    formData.append('question', options.question || 'what is shown in this image?')
    console.log('[understandingUpload] FormData created with file and question:', options.question)

    // Upload to server endpoint
    console.log('[understandingUpload] Sending request to server')
    const response = await fetch('/api/uploads/understanding', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[understandingUpload] Server error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('[understandingUpload] Server response:', {
      success: result.success,
      filename: result.filename,
      hasUnderstandings: !!result.understandings,
      understandingKeys: result.understandings ? Object.keys(result.understandings) : []
    })

    // Create message attachment
    const attachment = {
      type: 'image' as const,
      text: fileName,
      image: preview
    }
    console.log('[understandingUpload] Created attachment:', {
      type: attachment.type,
      hasImage: !!attachment.image,
      text: attachment.text
    })

    // Add messages to conversation (unless skipMessages is true)
    const { selectedConversation } = useChat()
    if (selectedConversation.value && !options.skipMessages) {
      // Add file message
      const fileMessage = {
        type: 'sent',
        text: `Uploaded ${fileName}`,
        time: new Date().toLocaleTimeString(),
        attachments: [attachment]
      }
      selectedConversation.value.messages.push(fileMessage)
      console.log('[understandingUpload] Added file message:', {
        type: fileMessage.type,
        text: fileMessage.text,
        attachments: fileMessage.attachments.length
      })

      // Add analysis message if we have understandings
      if (result.understandings) {
        const analysisMessage = {
          type: 'received',
          text: result.understandings.understanding || 'Here is my analysis of the image:',
          time: new Date().toLocaleTimeString(),
          attachments: [],
          metadata: result.understandings
        }
        selectedConversation.value.messages.push(analysisMessage)
        console.log('[understandingUpload] Added analysis message:', {
          type: analysisMessage.type,
          text: analysisMessage.text,
          hasMetadata: !!analysisMessage.metadata
        })
      }
    }

    const uploadResult = {
      success: true,
      attachment,
      understanding: result.understandings?.understanding,
      metadata: {
        filename: fileName,
        type: fileType,
        size: typeof fileData === 'string' ? fileData.length : fileData.length,
        lastModified: new Date().toISOString()
      }
    }
    console.log('[understandingUpload] Returning result:', {
      success: uploadResult.success,
      hasAttachment: !!uploadResult.attachment,
      hasUnderstanding: !!uploadResult.understanding,
      metadata: uploadResult.metadata
    })
    return uploadResult
  } catch (error) {
    console.error('[understandingUpload] Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Add error message to conversation
    const { selectedConversation } = useChat()
    if (selectedConversation.value && !options.skipMessages) {
      const errorMessage = {
        type: 'error',
        text: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        time: new Date().toLocaleTimeString(),
        attachments: []
      }
      selectedConversation.value.messages.push(errorMessage)
      console.log('[understandingUpload] Added error message:', {
        type: errorMessage.type,
        text: errorMessage.text
      })
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
