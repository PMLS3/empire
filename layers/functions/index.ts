// Main exports and shared handlers

import { functionGroups } from './groups';

// Global shared handlers that can be used as fallbacks
export const globalHandlers = {
  // Common utility functions that might be used by multiple agencies
  getCurrentTime: async () => {
    return {
      timestamp: Date.now(),
      formatted: new Date().toISOString()
    };
  },
  
  formatResponse: async (args: { content: string, format: string }) => {
    const { content, format } = args;
    
    switch (format.toLowerCase()) {
      case 'json':
        try {
          return JSON.parse(content);
        } catch (e) {
          return { error: 'Invalid JSON', originalContent: content };
        }
      case 'markdown':
        // Simple markdown formatting could be implemented here
        return { formatted: content };
      default:
        return { content };
    }
  }
};

// Export all function groups
export { functionGroups };

// Helper to combine function groups for an agency
export const combineGroups = (groupNames: string[]) => {
  const combined = {
    declarations: [],
    handlers: {},
    systemInstruction: ''
  };
  
  groupNames.forEach(groupName => {
    if (functionGroups[groupName]) {
      const group = functionGroups[groupName];
      combined.declarations.push(...group.declarations);
      combined.handlers = { ...combined.handlers, ...group.handlers };
      combined.systemInstruction += group.systemInstruction() + '\n\n';
    }
  });
  
  // Add global handlers as fallbacks
  combined.handlers = { ...combined.handlers, ...globalHandlers };
  
  return combined;
};
