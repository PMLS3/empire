import type { FunctionGroup } from '../types';
import { bookResearchFunctions } from './research/book';
export const researchFunctions: FunctionGroup = {
  declarations: [
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
            description: "Number of results to return"
          }
        },
        required: ["query"]
      }
    },
    ...bookResearchFunctions.declarations
  ],
  handlers: {
    googleSearch: async (args, context) => {
      const { query, numResults = 5 } = args;
      // Implementation would connect to search API
      return {
        results: [
          { title: "Example search result 1", snippet: "This is an example search result", url: "https://example.com/1" },
          { title: "Example search result 2", snippet: "This is another example search result", url: "https://example.com/2" }
        ]
      };
    },
    ...bookResearchFunctions.handlers
  },
  systemInstruction: () => `
    You are a research assistant that can help find information using search engines.
    When asked to research a topic, use the googleSearch function.
    \n${bookResearchFunctions.systemInstruction()}`
};
