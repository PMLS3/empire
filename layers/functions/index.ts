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
  
  console.log(`Combining function groups: ${groupNames.join(', ')}`);
  
  // Improve handling of nested objects in function parameters
  const processProperties = (props: any): any => {
    if (!props || typeof props !== 'object') return {};
    
    const result = {};
    
    Object.entries(props).forEach(([key, value]: [string, any]) => {
      const processedValue = { ...value };
      
      // Process nested object properties recursively
      if (value?.type === 'object' && value?.properties) {
        processedValue.properties = processProperties(value.properties);
      }
      
      // Remove default property as it's not supported by Gemini
      if ('default' in processedValue) {
        delete processedValue.default;
        console.log(`Removed 'default' from property ${key}`);
      }
      
      result[key] = processedValue;
    });
    
    return result;
  };
  
  groupNames.forEach(groupName => {
    if (functionGroups[groupName]) {
      const group = functionGroups[groupName];
      
      // Process function declarations to ensure they're properly formatted
      const processedDeclarations = group.declarations.map(decl => {
        // Skip if not valid
        if (!decl || !decl.name || !decl.parameters) {
          console.warn(`Invalid function declaration in group ${groupName}`);
          return null;
        }
        
        // Create a deep copy to avoid modifying the original
        const processedDecl = { ...decl };
        
        // Process parameters recursively
        if (decl.parameters?.properties) {
          processedDecl.parameters = {
            ...decl.parameters,
            properties: processProperties(decl.parameters.properties)
          };
        }
        
        return processedDecl;
      }).filter(Boolean);
      
      console.log(`Adding ${processedDeclarations.length} functions from group ${groupName}`);
      combined.declarations.push(...processedDeclarations);
      combined.handlers = { ...combined.handlers, ...group.handlers };
      combined.systemInstruction += group.systemInstruction() + '\n\n';
    } else {
      console.warn(`Function group "${groupName}" not found`);
    }
  });
  
  // Add global handlers as fallbacks
  combined.handlers = { ...combined.handlers, ...globalHandlers };
  
  return combined;
};
