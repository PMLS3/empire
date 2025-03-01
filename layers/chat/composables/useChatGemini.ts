import type { ChatMessage } from '~/types/chat'
import type {
  LiveConfig,
  LiveIncomingMessage,
  ServerContentMessage,
  RealtimeInputMessage,
  SetupMessage,
  GenerativeContentBlob,
  Part,
} from '../types/gemini'
import { useVoiceRecorder } from '../composables/media/useVoiceRecorder'
import { useAudioPlayer } from './media/useAudioPlayer'
import { functionHandlers } from './functions'
import { systemInstructionRouting, functionDeclarationsRouting } from './functions/routing'
// import { systemInstructionBook, functionDeclarationsBook } from './functions/publising'
// Separate interfaces for text and voice states
interface TextState {
  messages: ChatMessage[]
  currentResponse: { text: string, time: string } | null
  error: string
}

interface VoiceState {
  messages: ChatMessage[]
  isStreaming: boolean
  currentAudioResponse: {
    audio: string
    time: string
  } | null
  error: string
}

interface ConnectionState {
  isConnected: boolean
  wsState: WebSocket | null
  error: string
}

export const useChatGemini = (apiKeyOrConfig: string | { 
  apiKey: string, 
  functions?: any[], 
  systemInstruction?: string,
  stateKey?: string // Add parameter for instance-specific state
}) => {
  // Extract config parameters - Fix the TypeError by adding null checks and defaults
  const apiKey = typeof apiKeyOrConfig === 'string' 
    ? apiKeyOrConfig 
    : (apiKeyOrConfig && 'apiKey' in apiKeyOrConfig) ? apiKeyOrConfig.apiKey : '';
    
  const customFunctions = typeof apiKeyOrConfig === 'object' && apiKeyOrConfig 
    ? apiKeyOrConfig.functions 
    : undefined;
    
  const customSystemInstruction = typeof apiKeyOrConfig === 'object' && apiKeyOrConfig 
    ? apiKeyOrConfig.systemInstruction 
    : undefined;
    
  const stateKey = typeof apiKeyOrConfig === 'object' && apiKeyOrConfig && 'stateKey' in apiKeyOrConfig 
    ? apiKeyOrConfig.stateKey 
    : 'default';

  // Create instance-specific state keys
  const connectionStateKey = `connectionState-${stateKey}`
  const textStateKey = `textState-${stateKey}` 
  const voiceStateKey = `voiceState-${stateKey}`

  // Connection state (instance-specific)
  const connectionState = useState<ConnectionState>(connectionStateKey, () => ({
    isConnected: false,
    wsState: null,
    error: '',
  }))

  // Text-specific state (instance-specific)
  const textState = useState<TextState>(textStateKey, () => ({
    messages: [],
    currentResponse: null,
    error: '',
  }))

  // Voice-specific state (instance-specific)
  const voiceState = useState<VoiceState>(voiceStateKey, () => ({
    messages: [],
    isStreaming: false,
    currentAudioResponse: null,
    error: '',
  }))

  // Base configuration for text
  const textConfig: LiveConfig = {
    model: 'models/gemini-2.0-flash-exp',
    systemInstruction: {
      parts: [{
        text: `
          You are a chat assistant with access to functions. When using functions, do not write code - instead use the function calling format.

          For example, when asked to run a test, respond with a function call like this:
          {
            "name": "testFunction",
            "args": {
              "message": "Hello from the test function!"
            }
          }

          Book Data Structure:
          type Book = {
            keywords: string[]
            criteriaPassed: boolean
            bundlePossible: boolean
            bsrCriteria: {
              kindle: { amount: number, less: number, condition: boolean }
              paperback: { amount: number, less: number, condition: boolean }
              audible: { amount: number, less: number, condition: boolean }
            }
            search: { amount: number, condition: boolean }
            topic: string
            topicOptions: string[]
            category: string
            categoryOptions: string[]
            subCategory: string
            subCategoryOptions: string[]
            categoryAnalysis: string
            reviewsAnalysis: string
            bookStructure: string
            bookStructureBreakdown: string[]
            chapters: string[]
            bookPlan: string
            cover: string
            examples: Array<{
              title: string
              subtitle: string
              description: string
              cover: string
              author: string
              link: string
              chapters: string[]
              keywords: string[]
              category: string
              subCategory: string
            }>
          }

          Available functions:
          - testFunction: Test the function calling system
            Parameters: message (string) - Test message to send

          - callAI: Call another AI model
            Parameters: text (string) - Text to send to the AI

          - googleSearch: Performs a Google search
            Parameters: query (string) - The search query to execute

          - retrieveUser: Retrieves the current user's information
            Parameters: fields (array of strings) - List of user fields to retrieve (optional)





          - screenShot: Takes a screenshot of the current page
            Parameters: none

          - underStandingUpload: Uploads a file
            Parameters: file (file | string) - The file to upload or base64 image string

          - generateWordSearchWords: Add words to the word search puzzle
            Parameters:
              words (string[]) - List of words to add to the puzzle
            Example:
            {
              "name": "generateWordSearchWords",
              "args": {
                "words": ["elephant", "giraffe", "penguin", "dolphin", "kangaroo", "octopus", "cheetah", "flamingo", "porcupine", "zebra"]
              }
            }
            Note: When generating words:
            - Easy: Use 3-5 letter words (e.g., cat, dog, owl)
            - Medium: Use 5-8 letter words (e.g., rabbit, monkey, penguin)
            - Hard: Use 8+ letter words or compound words (e.g., crocodile, hippopotamus, hummingbird)

          - updateWordSearchSettings: Update word search puzzle settings
            Parameters:
              settings (object) - Object containing any of these properties:
                size (number) - Grid size (5-20)
                words (string[]) - List of words
                theme (string) - Puzzle theme
                difficulty (string) - 'easy', 'medium', or 'hard'
                textColor (string) - Hex color for text
                backgroundColor (string) - Hex color for background
                borderColor (string) - Hex color for borders
                locationsColor (string) - Hex color for found words
            Example:
            {
              "name": "updateWordSearchSettings",
              "args": {
                "settings": {
                  "size": 15,
                  "theme": "animals",
                  "difficulty": "medium"
                }
              }
            }

          - suggestWordSearchSettings: Apply suggested settings to the word search puzzle
            Parameters:
              settings (object) - Object containing suggested settings (same structure as updateWordSearchSettings)
            Example:
            {
              "name": "suggestWordSearchSettings",
              "args": {
                "settings": {
                  "size": 12,
                  "theme": "animals",
                  "difficulty": "medium",
                  "textColor": "#000000",
                  "backgroundColor": "#ffffff",
                  "borderColor": "#000000",
                  "locationsColor": "#ff0000"
                }
              }
            }

          - selectElement: Select an element in the editor by its ID
            Parameters:
              elementId (string) - ID of the element to select
            Example:
            {
              "name": "selectElement",
              "args": {
                "elementId": "puzzle-123"
              }
            }

          - orderElement: Change the stacking order of the selected element
            Parameters:
              action (string) - Either 'front' or 'back'
            Example:
            {
              "name": "orderElement",
              "args": {
                "action": "front"
              }
            }

          - updateElementStyle: Update an element's position or size
            Parameters:
              elementId (string) - ID of the element to update
              style (object) - Object containing any of:
                left (string) - Left position
                top (string) - Top position
                width (string) - Width
                height (string) - Height
            Example:
            {
              "name": "updateElementStyle",
              "args": {
                "elementId": "puzzle-123",
                "style": {
                  "left": "100px",
                  "top": "200px"
                }
              }
            }

          - updatePuzzleProperties: Update visual properties of a puzzle
            Parameters:
              elementId (string) - ID of the puzzle to update
              properties (object) - Object containing any of:
                textColor (string) - Color for puzzle text
                backgroundColor (string) - Color for puzzle background
                borderColor (string) - Color for puzzle borders
                locationsColor (string) - Color for found words
                showSolution (boolean) - Whether to show the solution
            Example:
            {
              "name": "updatePuzzleProperties",
              "args": {
                "elementId": "puzzle-123",
                "properties": {
                  "backgroundColor": "#00ff00",
                  "showSolution": true
                }
              }
            }
            Note: These properties can be updated without regenerating the puzzle.
            Do not attempt to modify grid size, words, or other structural properties.

          - getEditorState: Get information about the current page and its elements
            Parameters:
              requestType (string) - Type of information to retrieve
            Returns: Object containing:
              - currentPage: Information about the current page including all elements
              - selectedElement: ID of the currently selected element
            Example:
            {
              "name": "getEditorState",
              "args": {
                "requestType": "all"
              }
            }

            ${systemInstructionRouting()}



            - setCanvasMainElement: Set the routing element where the user will navigate
            Parameters:
              name (string) - The name of the element to set as the main element
              description (string) - The description of the element
              className (string) - The class name of the element
              props (object) - The properties of the element
              example:
              {
    name: 'publishingBookEditor',
    description: 'Editor for publishing books',
    className: '',
    props: {
      default: true,
    },
  }

            Note: Use this function to get information about elements before trying to modify them.

          Remember: Never write code or suggest code - only use the function calling format.

          IMPORTANT: You are a chat assistant for the One Person Empire. You are not an AI. You are a human.

          CONTEXT: When a function is called with information, I will send the information to you and start the message with /context which you should not respond to its just so that you have the context.

          - callAgencies: Call the Agencies
            Parameters: prompt (string) - The prompt to send to the Agencies
          `
      }]
    },
    generationConfig: {
      responseModalities: 'text',
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    tools: {
      functionDeclarations: [
        {
          name: "testFunction",
          description: "A test function that returns a simple message",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The test message to return"
              }
            },
            required: ["message"]
          }
        },
        {
          name: "callAI",
          description: "Calls the AI endpoint with a message",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The message to send to the AI"
              }
            },
            required: ["text"]
          }
        },
        {
          name: "googleSearch",
          description: "Performs a Google search",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to execute"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "retrieveUser",
          description: "Retrieves the current user's information",
          parameters: {
            type: "object",
            properties: {
              fields: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["name", "email", "avatar", "role", "preferences"]
                },
                description: "List of user fields to retrieve (optional)"
              }
            },
            required: []
          }
        },

        {
          name: "screenShot",
          description: "Takes a screenshot of the current page",
          parameters: {
            type: "object",
            properties: {
              screenshot: {
                type: "string",
                description: "The screenshot to upload"
              }
            },
            required: ["screenshot"]
          }
        },
        {
          name: "understandingUpload",
          description: "Uploads a file or base64 image string for analysis",
          parameters: {
            type: "object",
            properties: {
              file: {
                type: "string",
                description: "The file to upload (can be a File object or base64 image string)"
              }
            },
            required: ["file"]
          }
        },
        {
          name: "generateWordSearchWords",
          description: "Add words to the word search puzzle",
          parameters: {
            type: "object",
            properties: {
              words: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "List of words to add to the puzzle"
              }
            },
            required: []
          }
        },
        {
          name: "updateWordSearchSettings",
          description: "Update word search puzzle settings",
          parameters: {
            type: "object",
            properties: {
              settings: {
                type: "object",
                properties: {
                  size: {
                    type: "number",
                    description: "Grid size (5-20)"
                  },
                  words: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    description: "List of words"
                  },
                  theme: {
                    type: "string",
                    description: "Puzzle theme"
                  },
                  difficulty: {
                    type: "string",
                    description: "Difficulty level: 'easy', 'medium', or 'hard'"
                  },
                  textColor: {
                    type: "string",
                    description: "Hex color for text"
                  },
                  backgroundColor: {
                    type: "string",
                    description: "Hex color for background"
                  },
                  borderColor: {
                    type: "string",
                    description: "Hex color for borders"
                  },
                  locationsColor: {
                    type: "string",
                    description: "Hex color for found words"
                  }
                }
              }
            },
            required: ["settings"]
          }
        },
        {
          name: "suggestWordSearchSettings",
          description: "Apply suggested settings to the word search puzzle",
          parameters: {
            type: "object",
            properties: {
              settings: {
                type: "object",
                properties: {
                  size: {
                    type: "number",
                    description: "Grid size (5-20)"
                  },
                  words: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    description: "List of words"
                  },
                  theme: {
                    type: "string",
                    description: "Puzzle theme"
                  },
                  difficulty: {
                    type: "string",
                    description: "Difficulty level: 'easy', 'medium', or 'hard'"
                  },
                  textColor: {
                    type: "string",
                    description: "Hex color for text"
                  },
                  backgroundColor: {
                    type: "string",
                    description: "Hex color for background"
                  },
                  borderColor: {
                    type: "string",
                    description: "Hex color for borders"
                  },
                  locationsColor: {
                    type: "string",
                    description: "Hex color for found words"
                  }
                }
              }
            },
            required: ["settings"]
          }
        },
        {
          name: "selectElement",
          description: "Select an element in the editor by its ID",
          parameters: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description: "ID of the element to select"
              }
            },
            required: ["elementId"]
          }
        },
        {
          name: "orderElement",
          description: "Change the stacking order of the selected element",
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                description: "Either 'front' or 'back'"
              }
            },
            required: ["action"]
          }
        },
        {
          name: "updateElementStyle",
          description: "Update an element's position or size",
          parameters: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description: "ID of the element to update"
              },
              style: {
                type: "object",
                properties: {
                  left: {
                    type: "string",
                    description: "Left position"
                  },
                  top: {
                    type: "string",
                    description: "Top position"
                  },
                  width: {
                    type: "string",
                    description: "Width"
                  },
                  height: {
                    type: "string",
                    description: "Height"
                  }
                }
              }
            },
            required: ["elementId", "style"]
          }
        },
        {
          name: "updatePuzzleProperties",
          description: "Update visual properties of a puzzle",
          parameters: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description: "ID of the puzzle to update"
              },
              properties: {
                type: "object",
                properties: {
                  textColor: {
                    type: "string",
                    description: "Color for puzzle text"
                  },
                  backgroundColor: {
                    type: "string",
                    description: "Color for puzzle background"
                  },
                  borderColor: {
                    type: "string",
                    description: "Color for puzzle borders"
                  },
                  locationsColor: {
                    type: "string",
                    description: "Color for found words"
                  },
                  showSolution: {
                    type: "boolean",
                    description: "Whether to show the solution"
                  }
                }
              }
            },
            required: ["elementId", "properties"]
          }
        },
        {
          name: "getEditorState",
          description: "Get information about the current page and its elements",
          parameters: {
            type: "object",
            properties: {
              requestType: {
                type: "string",
                description: "Type of information to retrieve",
                enum: ["all"]
              }
            },
            required: ["requestType"]
          }
        },
        {
          name: "callAgencies",
          description: "Call the Agencies",
          parameters: {
            type: "object",
            properties: { prompt: { type: "string" } },
            required: ["prompt"]
          }
        },
       ...functionDeclarationsRouting,
      ]
    }
  }

  // Voice-specific configuration
  const voiceConfig: LiveConfig = {
    model: "models/gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Fenrir"
          }
        }
      }
    }
  }

  // Make a deep copy of the base textConfig
  const finalTextConfig = JSON.parse(JSON.stringify(textConfig));
  
  // Clean function declarations to avoid issues with reserved keywords and validate format
  const sanitizeFunctionDeclarations = (declarations: any[]) => {
    if (!declarations || !Array.isArray(declarations)) {
      console.error('Invalid function declarations format:', declarations);
      return [];
    }
    
    return declarations.map(func => {
      try {
        if (!func.name || typeof func.name !== 'string') {
          console.error('Function declaration missing name or name is not a string:', func);
          return null;
        }
        
        const cleanFunc: any = {
          name: func.name,
          description: func.description || 'No description provided.',
          parameters: {
            type: 'object',
            properties: {}
          }
        };
        
        if (func.parameters && func.parameters.properties) {
          Object.entries(func.parameters.properties).forEach(([propName, propValue]) => {
            const safeProp: any = { ...propValue };
            delete safeProp.default;
            
            // Ensure type and description are present
            safeProp.type = safeProp.type || 'string';
            safeProp.description = safeProp.description || 'No description provided.';
            
            cleanFunc.parameters.properties[propName] = safeProp;
          });
        }
        
        if (func.parameters && func.parameters.required) {
          cleanFunc.parameters.required = func.parameters.required;
        } else {
          cleanFunc.parameters.required = []; // Ensure required is always present
        }
        
        return cleanFunc;
      } catch (e) {
        console.error('Error sanitizing function:', func, e);
        return null;
      }
    }).filter(Boolean);
  };
  
  // Update Text Config if custom functions or system instruction provided
  if (customFunctions && Array.isArray(customFunctions) && customFunctions.length > 0) {
    try {
      const sanitizedFunctions = sanitizeFunctionDeclarations(customFunctions);
      console.log(`Applying ${sanitizedFunctions.length} custom functions to ${stateKey}`);
      
      // Replace with sanitized functions
      finalTextConfig.tools = {
        ...finalTextConfig.tools,
        functionDeclarations: sanitizedFunctions
      };
      
      // Debug logging - output the first function to check format
      if (sanitizedFunctions.length > 0) {
        console.log('Sample function declaration:', 
                    JSON.stringify(sanitizedFunctions[0]).substring(0, 150) + '...');
      }
    } catch (err) {
      console.error('Failed to apply custom functions:', err);
    }
  }
  
  if (customSystemInstruction) {
    console.log(`Applying custom system instruction to ${stateKey}`);
    finalTextConfig.systemInstruction = {
      parts: [{
        text: customSystemInstruction
      }]
    };
  }

  const openGeminiConnection = () => {
    console.log('Opening Gemini connection...', { apiKey: apiKey?.slice(0, 5) + '...' })

    if (!apiKey) {
      console.error('No API key provided')
      return null
    }

    try {
      // Close existing connection if any
      if (connectionState.value.wsState) {
        console.log('Closing existing connection')
        connectionState.value.wsState.close()
        connectionState.value.wsState = null
        connectionState.value.isConnected = false
      }

      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
      )

      ws.onopen = () => {
        console.log('Connection established')
        connectionState.value = {
          ...connectionState.value,
          isConnected: true,
          wsState: ws,
          error: '',
        }

        // Send initial setup with the finalTextConfig that includes custom functions
        const setupData = { setup: finalTextConfig }
        console.log(`Sending initial text setup for ${stateKey}:`, {
          functions: finalTextConfig.tools.functionDeclarations.length,
          systemInstruction: finalTextConfig.systemInstruction.parts[0].text.substring(0, 50) + '...'
        })
        
        try {
          // Validate JSON before sending
          const setupString = JSON.stringify(setupData);
          JSON.parse(setupString); // This will throw if invalid JSON
          
          ws.send(setupString)
        } catch (jsonError) {
          console.error('Invalid setup JSON:', jsonError);
          console.error('First 500 chars of JSON:', JSON.stringify(setupData).substring(0, 500));
          
          // Close with error
          ws.close(1000, 'Invalid setup JSON');
          
          connectionState.value = {
            ...connectionState.value,
            isConnected: false,
            wsState: null,
            error: 'Failed to create valid setup configuration',
          }
        }
      }

      ws.onmessage = async (event) => {
        try {
          let data: LiveIncomingMessage

          if (event.data instanceof Blob) {
            const text = await event.data.text()
            data = JSON.parse(text)
          } else {
            data = JSON.parse(event.data)
          }

          console.log('Received message:', data)

          if ('serverContent' in data) {
            if ('modelTurn' in data.serverContent) {
              handleTextContent(data)
              handleVoiceContent(data)  // Handle voice for each turn
            } else if ('turnComplete' in data.serverContent) {
              handleTextContent(data)
              handleVoiceContent(data)  // Handle voice for turn complete
            }
          } else if ('setupComplete' in data) {
            console.log('Setup complete')
          }
        } catch (error) {
          console.error('Error handling message:', error)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        connectionState.value.error = 'Connection error'
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event)
        console.log('Close reason:', event.reason)
        connectionState.value.isConnected = false
        connectionState.value.wsState = null
        connectionState.value.error = event.reason || 'Connection closed';
      }

      return ws
    } catch (error: any) {
      console.error('Error opening connection:', error)
      connectionState.value.error = error.message
      return null
    }
  }

  const handleTextContent = async (response: ServerContentMessage) => {
    const { serverContent } = response

    if ('modelTurn' in serverContent) {
      const { parts, functionCall }: any = serverContent.modelTurn

      // Handle function calls first
      if (functionCall) {
        try {
          const { name, args } = JSON.parse(functionCall)

          if (name && functionHandlers[name]) {
            const result = await functionHandlers[name](args, {
              addMessage: (message: ChatMessage) => {
                if (selectedConversation.value) {
                  selectedConversation.value.messages.push(message)
                }
              },
              sendFunctionResponseToGemini: async (functionName: string, response: any) => {
                const message: ChatMessage = {
                  type: 'function',
                  name: functionName,
                  response
                }
                await send(message)
              }
            })
          } else {
            console.error('[handleTextContent] Unknown function:', name, 'Available functions:', Object.keys(functionHandlers))
          }
        } catch (error) {
          console.error('[handleTextContent] Error executing function:', error)
        }
      }

      // Check for executable code that might contain function calls
      const executableParts = parts.filter(p => p.executableCode)
      if (executableParts.length > 0) {
        try {
          const code = executableParts[0].executableCode?.code || ''
          const trimmedCode = code.trim()
          let sanitizedCode: any
          try {
            // First check if it's already valid JSON
            try {
              sanitizedCode = JSON.parse(trimmedCode);
            } catch {
              // If not valid JSON, apply sanitization
              sanitizedCode = trimmedCode
                // Remove any "default" key from properties
                .replace(/^'''\n?|\n?'''$|"""\n?|\n?"""$/g, '') // Remove Python multiline string markers
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
                .replace(/: '([^']*)'/g, ': "$1"') // Replace single quotes with double quotes for simple values
                .replace(/: true/g, ': true') // Python-style True -> JavaScript true
                .replace(/: false/g, ': false') // Python-style False -> JavaScript false
                .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                // Special handling for URLs - do this last to avoid double processing
                .replace(/"(https?:\/\/[^"]+)"/g, (match) => {
                  // Escape any quotes within the URL
                  return match.replace(/"/g, '\\"');
                });
            }

            const parsedFunction = typeof sanitizedCode === 'string' ? JSON.parse(sanitizedCode) : sanitizedCode;
            if (parsedFunction.name) {
              await handleFunctionCall(parsedFunction)
              return
            }
          } catch (e) {
            console.error('[handleTextContent] Error parsing function call:', e)
            console.error('[handleTextContent] Original code:', trimmedCode)
            console.error('[handleTextContent] Sanitized code:', sanitizedCode)
          }
        } catch (error) {
          console.error('[handleTextContent] Error handling executable code:', error)
        }
      }

      // Handle regular text parts
      const textParts = parts.filter(p => !p.inlineData && !p.executableCode)
      if (textParts.length) {
        const text = textParts.map(p => p.text).join('')
        if (!text.trim()) return

        // Check if this is an echo of the user's message
        const lastMessage = textState.value.messages[textState.value.messages.length - 1]
        if (lastMessage && lastMessage.type === 'sent' && lastMessage.text === text) {
          return
        }

        // Update or create streaming message
        if (textState.value.currentResponse) {
          // Update existing message
          textState.value.currentResponse.text += text
          // Find and update the last message if it's from the current stream
          const lastMessage = textState.value.messages[textState.value.messages.length - 1]
          if (lastMessage && lastMessage.time === textState.value.currentResponse.time) {
            textState.value.messages = [
              ...textState.value.messages.slice(0, -1),
              {
                ...lastMessage,
                text: textState.value.currentResponse.text.replace(/\\n/g, '\n'),
              },
            ]
          }
        } else {
          // Start a new response
          const time = new Date().toLocaleTimeString()
          textState.value.currentResponse = {
            text,
            time,
          }
          // Add initial streaming message
          const message: ChatMessage = {
            type: 'received',
            text: text.replace(/\\n/g, '\n'),
            time,
            attachments: [],
          }
          textState.value.messages = [...textState.value.messages, message]
        }
      }
    } else if ('turnComplete' in serverContent) {
      // Reset current response
      textState.value.currentResponse = null
    }
  }

  const handleVoiceContent = (response: ServerContentMessage) => {
    const { serverContent } = response

    if ('modelTurn' in serverContent) {
      const { parts } = serverContent.modelTurn

      // Handle audio parts
      const audioParts = parts.filter(p => p.inlineData?.mimeType.startsWith('audio/'))
      if (audioParts.length) {
        const time = voiceState.value.currentAudioResponse?.time || new Date().toLocaleTimeString()

        // Create audio attachments
        const audioAttachments = audioParts.map(part => ({
          type: 'voice' as const,
          audio: `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`,
        }))

        // Update or create message
        if (voiceState.value.currentAudioResponse) {
          // Update existing message
          const lastMessage = voiceState.value.messages[voiceState.value.messages.length - 1]
          if (lastMessage && lastMessage.time === time) {
            voiceState.value.messages = [
              ...voiceState.value.messages.slice(0, -1),
              {
                ...lastMessage,
                attachments: [...(lastMessage.attachments || []), ...audioAttachments],
              },
            ]
          }
        } else {
          // Create new message
          voiceState.value.currentAudioResponse = { audio: audioAttachments[0].audio, time }
          voiceState.value.messages.push({
            type: 'received',
            text: 'Voice response',
            time,
            attachments: audioAttachments,
          })
        }
      }

      // Handle any text transcription if present
      const textParts = parts.filter(p => !p.inlineData)
      if (textParts.length) {
        const text = textParts.map(p => p.text).join('')

        // Update the last message if it exists
        const lastMessage = voiceState.value.messages[voiceState.value.messages.length - 1]
        if (lastMessage) {
          voiceState.value.messages = [
            ...voiceState.value.messages.slice(0, -1),
            {
              ...lastMessage,
              text,
            },
          ]
        }
      }
    } else if ('turnComplete' in serverContent) {
      voiceState.value.isStreaming = false
      voiceState.value.currentAudioResponse = null
    }
  }

  const sendFunctionResponseToGemini = async (functionName: string, response: any) => {
    if (!connectionState.value.wsState || !connectionState.value.isConnected) {
      console.error('No active WebSocket connection')
      return
    }

    try {
      const message = {
        clientContent: {
          turns: [{
            role: 'function',
            parts: [{
              text: `/context Function ${functionName} returned: ${JSON.stringify(response)}`
            }],
          }],
          turnComplete: true,
        },
      }

      connectionState.value.wsState.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending function response to Gemini:', error)
    }
  }

  const handleFunctionCall = async (functionCall: any) => {

    try {
      if (!functionHandlers[functionCall.name]) {
        return
      }

      await functionHandlers[functionCall.name](functionCall.args || {}, {
        addMessage: (message: ChatMessage) => {
          textState.value.messages.push(message)
        },
        sendFunctionResponseToGemini: async (functionName: string, response: any) => {
          if (!connectionState.value.wsState) {
            console.error('[sendFunctionResponseToGemini] No WebSocket connection')
            return
          }

          const message = {
            clientContent: {
              turns: [{
                role: 'function',
                parts: [{
                  text: `/context Function ${functionName} returned: ${JSON.stringify(response)}`
                }],
              }],
              turnComplete: true
            }
          }

          connectionState.value.wsState.send(JSON.stringify(message))
        }
      })
    } catch (error) {
      console.error('[handleFunctionCall] Error executing function:', error)
    }
  }

  const sendTextMessage = async (text: string) => {
    if (!connectionState.value.wsState || !connectionState.value.isConnected) {
      console.error('No active WebSocket connection')
      return
    }

    try {
      // Add user message to conversation first
      const userMessage: ChatMessage = {
        type: 'sent',
        text,
        time: new Date().toLocaleTimeString(),
        attachments: [],
      }
      textState.value.messages = [...textState.value.messages, userMessage]

      const message = {
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{ text }],
          }],
          turnComplete: true,
        },
      }

      connectionState.value.wsState.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending text message:', error)
      textState.value.error = 'Failed to send message'
    }
  }

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!connectionState.value.wsState || !connectionState.value.isConnected) {
      console.error('No active WebSocket connection')
      return
    }

    try {
      // Convert blob to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
          } else {
            reject(new Error('Failed to convert audio to base64'))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(audioBlob)
      })

      // Add user's voice message to conversation
      const userMessage: ChatMessage = {
        type: 'sent',
        text: '🎤 Voice message',
        time: new Date().toLocaleTimeString(),
        attachments: [{
          type: 'voice',
          audio: URL.createObjectURL(audioBlob),
        }],
      }
      voiceState.value.messages.push(userMessage)

      // Send voice data
      const message = {
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{
              inlineData: {
                mimeType: 'audio/wav', // Adjust based on your audio format
                data: base64Audio,
              },
            }],
          }],
          turnComplete: true,
        },
      }

      voiceState.value.isStreaming = true
      connectionState.value.wsState.send(JSON.stringify(message))
    } catch (error) {
      voiceState.value.error = 'Failed to send voice message'
      voiceState.value.isStreaming = false
    }
  }

  const { playAudioResponse } = useAudioPlayer()

  const voiceRecorder = useVoiceRecorder({
    onData: async (base64Audio: string) => {
      if (!voiceState.value.isStreaming) {
        console.log('🎙️ [4x] Voice Sequence: Skipping audio chunk - setup not complete')
        return
      }

      if (!connectionState.value.wsState || !connectionState.value.isConnected) {
        console.error('❌ [4a] Voice Sequence: No active WebSocket connection for chunk')
        voiceState.value.isStreaming = false
        return
      }

      try {
        console.log('🎙️ [4] Voice Sequence: Sending voice chunk', { chunkSize: base64Audio.length })
        const audioMessage: RealtimeInputMessage = {
          realtimeInput: {
            mediaChunks: [{
              data: base64Audio,
              mimeType: 'audio/pcm'
            }]
          }
        }
        connectionState.value.wsState.send(JSON.stringify(audioMessage))
        console.log('✅ [4b] Voice Sequence: Voice chunk sent successfully')
      } catch (error) {
        console.error('❌ [4c] Voice Sequence: Failed to send voice chunk', error)
        voiceState.value.isStreaming = false
      }
    },
    onStop: () => {
      console.log('🎙️ [5] Voice Sequence: Recording stopped, sending turn completion')
      if (connectionState.value.wsState && voiceState.value.isStreaming) {
        // Send turn completion message
        const turnCompleteMessage = {
          realtimeInput: {
            turnComplete: true
          }
        }
        connectionState.value.wsState.send(JSON.stringify(turnCompleteMessage))
        console.log('✅ [5a] Voice Sequence: Turn completion sent')
      }
      voiceState.value.isStreaming = false
    }
  })

  const startVoiceRecording = () => {
    return new Promise<typeof voiceRecorder>((resolve, reject) => {
      console.log('🎙️ [1] Voice Sequence: Starting voice recording setup')

      // Check WebSocket connection and API key
      if (!connectionState.value.wsState || !connectionState.value.isConnected) {
        console.error('❌ [1a] Voice Sequence: No active WebSocket connection')
        reject(new Error('No active WebSocket connection'))
        return
      }

      // Get the current WebSocket URL to extract API key
      const currentWsUrl = connectionState.value.wsState.url
      const apiKey = new URL(currentWsUrl).searchParams.get('key')

      if (!apiKey) {
        console.error('❌ [1c] Voice Sequence: No API key available')
        reject(new Error('No API key available'))
        return
      }

      console.log('✅ [1b] Voice Sequence: WebSocket connection verified')

      // Reset streaming state
      voiceState.value.isStreaming = false

      // Create a new WebSocket for voice
      try {
        const voiceWs = new WebSocket(
          `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
        )

        voiceWs.onopen = () => {
          console.log('🎙️ [2] Voice Sequence: Voice WebSocket connection established')

          // Send voice setup message
          const setupMessage: SetupMessage = {
            setup: voiceConfig
          }
          console.log('🎙️ [2a] Voice Sequence: Sending voice setup message', JSON.stringify(setupMessage, null, 2))
          voiceWs.send(JSON.stringify(setupMessage))
        }

        // Add message handler for setup phase
        const setupHandler = (event: MessageEvent) => {
          console.log('🎙️ [2b] Voice Sequence: Received WebSocket message:', event.data)
          try {
            let data: LiveIncomingMessage

            if (event.data instanceof Blob) {
              console.log('🎙️ [2c] Voice Sequence: Processing Blob message')
              blobToJSON(event.data).then(parsedData => {
                console.log('🎙️ [2d] Voice Sequence: Parsed Blob message:', parsedData)
                if (isSetupCompleteMessage(parsedData)) {
                  console.log('✅ [2e] Voice Sequence: Setup complete message received')
                  voiceWs.removeEventListener('message', setupHandler)

                  // Add response handler after setup is complete
                  voiceWs.addEventListener('message', async (event) => {
                    if (event.data instanceof Blob) {
                      const response = await blobToJSON(event.data)
                      console.log('🎙️ [6] Voice Sequence: Received response:', response)

                      if (isServerContentMessage(response)) {
                        const { serverContent } = response
                        if (serverContent.modelTurn?.parts) {
                          const audioParts = serverContent.modelTurn.parts.filter(
                            p => p.inlineData?.mimeType.startsWith('audio/')
                          )

                          audioParts.forEach(part => {
                            if (part.inlineData?.data) {
                              const audioData = base64ToArrayBuffer(part.inlineData.data)
                              console.log('✅ [6a] Voice Sequence: Processing audio response', { size: audioData.byteLength })
                              playAudioResponse(audioData)
                            }
                          })
                        }
                      }
                    }
                  })

                  connectionState.value.wsState = voiceWs
                  voiceState.value.isStreaming = true
                  console.log('✅ [3] Voice Sequence: Voice recording setup complete')
                  resolve(voiceRecorder)
                } else {
                  console.log('❓ [2f] Voice Sequence: Unexpected message type:', parsedData)
                }
              }).catch(error => {
                console.error('❌ [2g] Voice Sequence: Failed to parse Blob:', error)
                reject(error)
              })
            } else {
              console.log('🎙️ [2h] Voice Sequence: Processing string message')
              data = JSON.parse(event.data)
              console.log('🎙️ [2i] Voice Sequence: Parsed string message:', data)
              if (isSetupCompleteMessage(data)) {
                console.log('✅ [2j] Voice Sequence: Setup complete message received')
                voiceWs.removeEventListener('message', setupHandler)

                // Add response handler after setup is complete
                voiceWs.addEventListener('message', async (event) => {
                  if (event.data instanceof Blob) {
                    const response = await blobToJSON(event.data)
                    console.log('🎙️ [6] Voice Sequence: Received response:', response)

                    if (isServerContentMessage(response)) {
                      const { serverContent } = response
                      if (serverContent.modelTurn?.parts) {
                        const audioParts = serverContent.modelTurn.parts.filter(
                          p => p.inlineData?.mimeType.startsWith('audio/')
                        )

                        audioParts.forEach(part => {
                          if (part.inlineData?.data) {
                            const audioData = base64ToArrayBuffer(part.inlineData.data)
                            console.log('✅ [6a] Voice Sequence: Processing audio response', { size: audioData.byteLength })
                            playAudioResponse(audioData)
                          }
                        })
                      }
                    }
                  }
                })

                connectionState.value.wsState = voiceWs
                voiceState.value.isStreaming = true
                console.log('✅ [3] Voice Sequence: Voice recording setup complete')
                resolve(voiceRecorder)
              } else {
                console.log('❓ [2k] Voice Sequence: Unexpected message type:', data)
              }
            }
          } catch (error) {
            console.error('❌ [2l] Voice Sequence: Error processing setup response:', error)
            reject(error)
          }
        }

        // Add error handler for setup phase
        const setupErrorHandler = (event: CloseEvent) => {
          console.error('❌ [2m] Voice Sequence: WebSocket closed during setup', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            fullError: event
          })
          voiceWs.removeEventListener('message', setupHandler)
          voiceWs.removeEventListener('close', setupErrorHandler)
          connectionState.value.isConnected = false
          connectionState.value.wsState = null
          voiceState.value.isStreaming = false
          reject(new Error(`WebSocket closed during setup: ${event.reason}`))
        }

        // Add error event handler
        voiceWs.onerror = (event) => {
          console.error('❌ [2n] Voice Sequence: WebSocket error:', event)
        }

        voiceWs.addEventListener('message', setupHandler)
        voiceWs.addEventListener('close', setupErrorHandler)

        // Remove error handler after timeout
        setTimeout(() => {
          if (!voiceState.value.isStreaming) {
            console.error('❌ [2o] Voice Sequence: Setup timed out')
            voiceWs.removeEventListener('message', setupHandler)
            voiceWs.removeEventListener('close', setupErrorHandler)
            reject(new Error('Voice setup timed out'))
          }
        }, 5000)
      } catch (error) {
        console.error('❌ [2p] Voice Sequence: Failed to send setup message', error)
        reject(error)
      }
    })
  }

  const sendRealtimeInput = (mediaChunks: GenerativeContentBlob[]) => {
    if (!connectionState.value.wsState || !connectionState.value.isConnected) {
      console.error('No active WebSocket connection')
      return
    }

    try {
      const message: RealtimeInputMessage = {
        realtimeInput: {
          mediaChunks
        }
      }

      console.log('Sending realtime input:', {
        type: mediaChunks[0]?.mimeType,
        size: mediaChunks[0]?.data.length
      })
      connectionState.value.wsState.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending realtime input:', error)
    }
  }

  const sendContextInfo = async (contextInfo: string) => {
    if (!connectionState.value.wsState || !connectionState.value.isConnected) {
      console.error('No active WebSocket connection')
      return
    }

    try {
      const message = {
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{
              text: `/context ${contextInfo}`
            }],
          }],
          turnComplete: true,
        },
      }

      console.log('Sending context info to Gemini:', contextInfo)
      connectionState.value.wsState.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending context info:', error)
    }
  }

  return {
    // Connection state
    isConnected: computed(() => connectionState.value.isConnected),
    connectionError: computed(() => connectionState.value.error),

    // Text functionality
    messages: computed(() => textState.value.messages),
    textError: computed(() => textState.value.error),

    // Voice functionality
    voiceMessages: computed(() => voiceState.value.messages),
    isVoiceStreaming: computed(() => voiceState.value.isStreaming),
    voiceError: computed(() => voiceState.value.error),
    startVoiceRecording,

    // Methods
    openGeminiConnection,
    sendMessage: sendTextMessage, // Text
    sendVoiceMessage, // Voice
    sendContextInfo,
    api: {
      sendRealtimeInput
    },
    toggleReadText: () => readText.value = !readText.value,
    stopSpeaking: () => window.speechSynthesis?.cancel()
  }
}

function blobToJSON(blob: Blob): Promise<LiveIncomingMessage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(JSON.parse(reader.result))
      } else {
        reject(new Error('Failed to convert blob to JSON'))
      }
    }
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

function isSetupCompleteMessage(data: LiveIncomingMessage): boolean {
  return 'setupComplete' in data
}

function isServerContentMessage(data: LiveIncomingMessage): boolean {
  return 'serverContent' in data
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}