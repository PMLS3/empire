// Function group definitions and exports

import { crmFunctions, researchFunctions, publishingFunctions } from './groups/index'

interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface FunctionGroup {
  declarations: FunctionDeclaration[];
  handlers: Record<string, (args: any, context?: any) => Promise<any>>;
  systemInstruction: () => string;
}

export const functionGroups: Record<string, FunctionGroup> = {
  // Research function group
  research: researchFunctions,

  // Publishing function group
  publishing: publishingFunctions,

  // CRM function group
  crm: crmFunctions
};
