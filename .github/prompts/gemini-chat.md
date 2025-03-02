# Dynamic Agency Chat System Architecture

## Overview

The Agency Chat System provides a flexible framework for creating specialized chat agents that can use different function groups and connect to either Gemini AI or a dedicated WebSocket backend. This document explains the architecture and implementation details.

## Core Components

### 1. Function Groups Organization

Functions are organized by domain in the `/functions` directory structure:

```
/functions
├── index.ts               # Main exports and shared handlers
├── groups.ts              # Function group definitions and exports
├── routing/               # Routing-related functions
├── publishing/            # Publishing-related functions
├── research/              # Research-related functions
└── crm/                   # CRM-related functions
```

Each function group consists of:
- Declaration of functions (parameters, types, etc.)
- Implementation of function handlers
- System instructions specific to that domain

### 2. Function Group Registration

Function groups are registered in `functions/groups.ts`:

```typescript
export const functionGroups: Record<string, FunctionGroup> = {
  // Research function group
  research: {
    declarations: [
      // Function declarations for research capabilities
      {
        name: "googleSearch",
        description: "Performs a Google search",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query"
            },
            numResults: {
              type: "number",
              description: "Number of results to return",
              default: 5
            }
          },
          required: ["query"]
        }
      },
      // More research functions...
    ],
    handlers: {
      // Implementation of functions
      googleSearch: async (args, context) => { /* implementation */ }
    },
    systemInstruction: () => `
      You are a research assistant that can help find information using search engines.
      When asked to research a topic, use the googleSearch function.
    `
  },
  
  // Other function groups follow the same pattern...
}
```

### 3. Function Declaration Structure

When defining functions, pay careful attention to nested object parameters which require proper structured definitions:

```typescript
// CORRECT: Properly defined nested object
{
  name: "updateCustomerRecord",
  description: "Updates a customer record",
  parameters: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer's unique identifier"
      },
      fields: {
        type: "object",
        description: "The fields to update",
        properties: {  // Define nested properties explicitly
          name: {
            type: "string",
            description: "Customer name"
          },
          email: {
            type: "string",
            description: "Customer email"
          }
        }
      }
    },
    required: ["customerId", "fields"]
  }
}

// INCORRECT: Generic object without properties
{
  name: "updateCustomerRecord",
  parameters: {
    type: "object",
    properties: {
      customerId: { type: "string" },
      fields: { type: "object" }  // Missing nested properties!
    }
  }
}
```

### 4. Function Group Combination

The `combineGroups` function in `functions/index.ts` combines multiple function groups for an agency:

```typescript
const combinedGroups = combineGroups(['crm', 'research']);
// Results in:
// {
//   declarations: [...crmFunctions, ...researchFunctions],
//   handlers: {...crmHandlers, ...researchHandlers},
//   systemInstruction: crmInstructions + researchInstructions
// }
```

This combined group is then used to configure the Gemini API or server-based agency.

### 5. Function Sanitization

Before sending function declarations to Gemini, they are sanitized to ensure compatibility:

1. Removal of unsupported properties (e.g., `default`)
2. Recursively processing nested object properties
3. Ensuring required fields are present and properly formatted
4. Validating enum values are arrays

## Agency Configuration

The `useChatAgency` composable provides a flexible way to create specialized chat agents:

```typescript
// Example usage
const crmAgent = useChatAgency({
  apiKey: 'your-gemini-api-key',
  functionGroups: ['crm', 'research'], // Use functions from multiple groups
  customInstructions: 'Focus on helping with customer relationship management.',
  enableVoice: true,
  enableScreenShare: false
})

// Server-based specialized agent
const publishingAgent = useChatAgency({
  serverBased: true,
  serverUrl: 'wss://your-backend.com/agency/publishing',
  functionGroups: ['publishing', 'research']
})
```

## Connection Modes

The system supports two primary connection modes:

### 1. Gemini-based Agencies

- Uses Gemini API via WebSockets for AI capabilities
- Function execution happens client-side
- Real-time streaming for text and voice
- Similar implementation to `useChatGemini`
- Recommended for simple, standalone agents

### 2. Server-based Agencies

- Uses dedicated WebSocket backend services
- Function execution happens server-side
- Can access secure services not available client-side
- Based on the architecture described in `websocket-chat.md`
- Recommended for complex agents that require server resources

## Input/Output Modalities

Both connection modes support the same interaction modalities:

### 1. Text Chat

- Standard text input/output
- Real-time streaming response
- Message history tracking
- Function calling capabilities

### 2. Voice Chat

- Voice input via microphone
- Voice output via text-to-speech
- Real-time streaming for both input/output
- Uses the same `useVoiceRecorder` and `useAudioPlayer` composables

### 3. Screen Share

- Shares user's screen to provide visual context
- Uses the existing `useVideo` composable
- Captures frames for analysis
- Works with both Gemini and server backends

## Integration with Existing UI

The agency system integrates with the existing UI components:

1. **Chat Selection**: When a user selects a chat, the system:
   - Identifies the agency type from the conversation object
   - Initializes the appropriate agency with the correct function groups
   - Establishes connection (Gemini or WebSocket backend)

2. **Conversation State**: The UI components like `ChatConversationMessages` display messages from the current conversation regardless of agency type.

3. **Input Modalities**: The existing UI components support all input modalities:
   - `ChatConversationComposeTextarea` for text input
   - `ChatConversationTypesVoice` for voice input
   - `ChatConversationTypesShare` for screen sharing

## Best Practices

1. **Function Group Organization**:
   - Keep related functions together in logical groups
   - Provide clear documentation for each function
   - Follow consistent naming conventions

2. **Function Declaration**:
   - Always specify detailed properties for object parameters
   - Use proper typing for parameters (string, number, boolean, object, array)
   - Provide meaningful descriptions for each parameter
   - Specify required parameters in the required array
   - For nested objects, define all child properties explicitly

3. **Agency Design**:
   - Single responsibility: Each agency should have a clear purpose
   - Appropriate connection mode: Choose Gemini for simple agents, WebSocket for complex ones
   - Minimal function sets: Only include the functions the agency needs

4. **Error Handling**:
   - Implement robust sanitization for function declarations
   - Provide meaningful error messages in the UI
   - Handle connection failures gracefully
   - Log detailed information for debugging purposes

## Debugging Tips

1. **Function Declaration Issues**:
   - Check the browser console for sanitization warnings
   - Ensure all object properties have explicit property definitions
   - Verify that required fields are properly set as arrays
   - Remove any `default` properties as Gemini doesn't support them

2. **Connection Problems**:
   - Examine WebSocket close events in the console for specific error messages
   - Validate API keys and server URLs
   - Check network requests for any 4xx or 5xx responses

3. **Function Execution**:
   - Add debugging logs in function handlers
   - Check that function declarations match expected names in handlers
   - Verify context properties are correctly passed to handlers

## Architecture Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌───────────────┐
│             │     │                 │     │               │
│  Chat UI    │◄────┤  useChatAgency  │◄────┤ Function      │
│ Components  │     │  Composable     │     │ Groups        │
│             │     │                 │     │               │
└─────────────┘     └─────────────────┘     └───────────────┘
       ▲                    ▲ ▲                    ▲
       │                    │ │                    │
       │                    │ │                    │
       │                    │ │                    │
       │             ┌──────┘ └────────┐          │
       │             │                 │          │
┌──────┴──────┐      ▼                 ▼          │
│             │    ┌──────────┐    ┌──────────┐   │
│  useChat    │    │ Gemini   │    │ Server   │   │
│ Composable  │    │ API      │    │ WebSocket│   │
│             │    │ (WSS)    │    │ Backend  │   │
└─────────────┘    └──────────┘    └──────────┘   │
       ▲                                          │
       │                                          │
┌──────┴──────┐                                   │
│             │                                   │
│ Chat State  │◄──────────────────────────────────┘
│ Management  │
│             │
└─────────────┘
```

## Adding a New Agency

To add a new agency type to the system:

1. **Define Functions**:
   ```typescript
   // Add to functions/groups.ts
   export const functionGroups = {
     myNewAgency: {
       declarations: [
         // Function declarations
       ],
       handlers: {
         // Function implementations
       },
       systemInstruction: () => `
         // Agency instructions
       `
     },
     // ...existing groups
   }
   ```

2. **Create Agency Instance**:
   ```typescript
   // In your composable
   const myNewAgency = useChatAgency({
     apiKey: config.public.geminiApiKey,
     functionGroups: ['myNewAgency', 'research'],
     customInstructions: 'Your custom instructions here.',
     enableVoice: true
   })
   ```

3. **Register in Chat System**:
   ```typescript
   // Add to conversations list
   const conversations = useState<Conversation[]>('conversations', () => [
     // ...existing conversations
     {
       id: nextId,
       user: {
         name: 'My New Assistant',
         photo: '/img/avatars/new-assistant.svg',
         role: 'my-new-agency',
         bio: 'I am your new specialized assistant.',
         age: 1,
         location: 'Agency Cloud',
       },
       messages: [],
     }
   ])

   // Add to agency mapping
   const agencyChats = {
     // ...existing agencies
     'my-new-agency': myNewAgency
   }
   ```

With these implementations, your agency system now provides a flexible, maintainable framework for creating specialized AI assistants with different capabilities and connection modes.
