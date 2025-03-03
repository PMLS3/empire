export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface FunctionGroup {
  declarations: FunctionDeclaration[];
  handlers: Record<string, (args: any, context?: any) => Promise<any>>;
  systemInstruction: () => string;
}
