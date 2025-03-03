import { FunctionGroup } from '../types';

export const crmFunctions: FunctionGroup = {
  declarations: [
    {
      name: "getCustomerInfo",
      description: "Retrieves customer information",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The customer's unique identifier"
          }
        },
        required: ["customerId"]
      }
    },
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
            properties: {
              name: {
                type: "string",
                description: "Customer name"
              },
              email: {
                type: "string",
                description: "Customer email"
              },
              status: {
                type: "string",
                description: "Customer status",
                enum: ["active", "inactive", "pending"]
              },
              notes: {
                type: "string",
                description: "Notes about the customer"
              }
            }
          }
        },
        required: ["customerId", "fields"]
      }
    }
  ],
  handlers: {
    getCustomerInfo: async (args, context) => {
      const { customerId } = args;
      // Implementation would fetch from CRM system
      return {
        id: customerId,
        name: "Example Customer",
        email: "customer@example.com",
        status: "active",
        purchaseHistory: [
          { date: "2023-01-15", product: "Product A", amount: 99.99 }
        ]
      };
    },
    updateCustomerRecord: async (args, context) => {
      const { customerId, fields } = args;
      // Implementation would update CRM system
      return {
        success: true,
        updatedFields: Object.keys(fields)
      };
    }
  },
  systemInstruction: () => `
    You are a CRM assistant that can help manage customer relationships.
    Use getCustomerInfo to retrieve customer details.
    Use updateCustomerRecord to update customer information.
  `
};
