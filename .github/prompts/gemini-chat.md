# Dynamic Agency Chat System Architecture

## Overview

The Agency Chat System provides a flexible framework for creating specialized chat agents that can use different function groups and connect to either Gemini AI or a dedicated WebSocket backend. This document explains the architecture and implementation details.

## Core Components

### 1. Function Groups Organization

Functions are organized by domain in the `/functions` directory structure:

```
/functions
├── index.ts               # Main exports and shared handlers
├── routing/               # Routing-related functions
├── publishing/            # Publishing-related functions
├── research/              # Research-related functions
├── crm/                   # CRM-related functions
└── groups.ts              # Function group definitions and exports
```

Each function group consists of:
- Declaration of functions (parameters, types, etc.)
- Implementation of function handlers
- System instructions specific to that domain

### 2. Function Group Registration

Function groups are registered in `functions/groups.ts`:

```typescript
// Example structure of function groups
export const functionGroups = {
  // Research function group
  research: {
    declarations: [
      // Function declarations for research capabilities
      {
        name: "googleSearch",
        description: "Performs a Google search",
        parameters: { /* parameter definitions */ }
      },
      // More research functions...
    ],
    handlers: {
      // Implementation of functions
      googleSearch: async (args, context) => { /* implementation */ }
      // More handlers...
    },
    systemInstruction: () => `
      You are a research assistant that can help find information using search engines.
      When asked to research a topic, use the googleSearch function.
    `
  },
  
  // Publishing function group
  publishing: {
    declarations: [/* publishing function declarations */],
    handlers: {/* publishing function implementations */},
    systemInstruction: () => `
      You are a book publishing assistant that can help analyze markets and plan book projects.
    `
  },
  
  // CRM function group
  crm: {
    declarations: [/* CRM function declarations */],
    handlers: {/* CRM function implementations */},
    systemInstruction: () => `
      You are a CRM assistant that can help manage customer relationships.
    `
  }
}
```

### 3. Dynamic Agency Composable

The `useChatAgency` composable provides a flexible way to create specialized chat agents:

```typescript
// Example usage
const crmAgent = useChatAgency({
  apiKey: 'your-gemini-api-key',
  functionGroups: ['crm', 'research'], // Use functions from multiple groups
  customInstructions: 'Focus on helping with customer relationship management.'
})

// Server-based specialized agent
const publishingAgent = useChatAgency({
  serverBased: true,
  serverUrl: 'wss://your-backend.com/agency/publishing',
  functionGroups: ['publishing']
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
- Uses the same `useVoiceRecorder` and `useAudioPlayer` composables as Gemini

### 3. Screen Share

- Shares user's screen to provide visual context
- Uses the existing `useVideo` composable
- Captures frames for analysis
- Works with both Gemini and server backends

## Integration with Existing UI

The agency system integrates with the existing UI components without modification:

1. **Chat Selection**: When a user selects a chat in `ChatConversationList`, the system:
   - Identifies the agency type from the conversation object
   - Initializes the appropriate agency with the correct function groups
   - Establishes connection (Gemini or WebSocket backend)

2. **Conversation State**: The UI components like `ChatConversationMessages` display messages from the current conversation regardless of agency type.

3. **Input Modalities**: The existing UI components support all input modalities:
   - `ChatConversationComposeTextarea` for text input
   - `ChatConversationTypesVoice` for voice input
   - `ChatConversationTypesShare` for screen sharing

## Conversation Configuration

Each conversation in the chat system includes configuration for its agency type:

```typescript
// Example conversation object
{
  id: 'conv-123',
  title: 'CRM Assistant',
  user: {
    name: 'CRM Agent',
    photo: '/img/avatars/crm-agent.svg',
    role: 'agency'
  },
  messages: [],
  agency: {
    type: 'crm',
    functionGroups: ['crm', 'research'],
    serverBased: false,
    customInstructions: 'You are a CRM assistant focused on helping manage customer relationships.'
  }
}
```

## Flow Diagram

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

## Integration Example

Here's how to add a new agency chat to the system:

1. **Define Agency Functions**:
   - Add new function declarations and handlers to appropriate groups
   - Or create a new function group if needed

2. **Create Agency Configuration**:
   - Define agency type, function groups, and connection mode
   - Add any custom instructions

3. **Register in Chat System**:
   - Add the agency to available conversations
   - The UI will automatically use the correct agency when selected

## Advanced Features

### 1. Mixed Function Groups

Agencies can mix functions from multiple groups. For example, a publishing agent might use functions from both publishing and research groups.

### 2. Dynamic System Instructions

System instructions are generated dynamically based on the function groups included, ensuring the AI understands the full range of capabilities.

### 3. Fallback Support

If a specific function isn't found in the agency's function groups, the system will check global handlers as a fallback.

### 4. State Persistence

Both Gemini and WebSocket backends support conversation persistence and can restore state when reconnecting to an existing conversation.

## Best Practices

1. **Function Group Organization**:
   - Keep related functions together in logical groups
   - Provide clear documentation for each function
   - Follow consistent naming conventions

2. **Agency Design**:
   - Single responsibility: Each agency should have a clear purpose
   - Appropriate connection mode: Choose Gemini for simple agents, WebSocket for complex ones
   - Minimal function sets: Only include the functions the agency needs

3. **Error Handling**:
   - Provide graceful fallbacks for connection issues
   - Clear error messages in the UI
   - Reconnection logic for temporary disruptions
