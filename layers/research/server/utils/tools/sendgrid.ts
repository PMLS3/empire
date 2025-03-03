import { Tool } from "@langchain/core/tools";
import axios from "axios";

/**
 * SendGridEmailTool - A tool for sending emails using SendGrid
 */
export class SendGridEmailTool extends Tool {
  name = "sendgrid_email";
  description = "A tool for sending emails using SendGrid. Input should be a JSON string with 'to', 'subject', 'text', and optional 'from', 'html', 'cc', 'bcc', 'attachments' fields.";
  
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    super();
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { to, subject, text, from, html, cc, bcc, attachments } = params;

      if (!to) {
        throw new Error("'to' field is required");
      }

      if (!subject) {
        throw new Error("'subject' field is required");
      }

      if (!text && !html) {
        throw new Error("Either 'text' or 'html' field is required");
      }

      const message = {
        personalizations: [
          {
            to: Array.isArray(to) ? to : [{ email: to }],
            subject,
            ...(cc && { cc: Array.isArray(cc) ? cc : [{ email: cc }] }),
            ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [{ email: bcc }] }),
          },
        ],
        from: { email: from || this.defaultFrom },
        content: [
          {
            type: "text/plain",
            value: text || "",
          },
          ...(html
            ? [
                {
                  type: "text/html",
                  value: html,
                },
              ]
            : []),
        ],
        ...(attachments && { attachments }),
      };

      const response = await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        message,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 202) {
        return JSON.stringify({
          success: true,
          message: "Email sent successfully",
        });
      } else {
        throw new Error(`SendGrid API returned status code: ${response.status}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `SendGrid API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`SendGrid error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in SendGrid operation");
    }
  }
}

/**
 * SendGridTemplateEmailTool - A tool for sending template emails using SendGrid
 */
export class SendGridTemplateEmailTool extends Tool {
  name = "sendgrid_template_email";
  description = "A tool for sending template emails using SendGrid. Input should be a JSON string with 'to', 'templateId', 'dynamicTemplateData', and optional 'from', 'cc', 'bcc' fields.";
  
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    super();
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { to, templateId, dynamicTemplateData, from, cc, bcc } = params;

      if (!to) {
        throw new Error("'to' field is required");
      }

      if (!templateId) {
        throw new Error("'templateId' field is required");
      }

      const message = {
        personalizations: [
          {
            to: Array.isArray(to) ? to : [{ email: to }],
            ...(cc && { cc: Array.isArray(cc) ? cc : [{ email: cc }] }),
            ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [{ email: bcc }] }),
            ...(dynamicTemplateData && { dynamic_template_data: dynamicTemplateData }),
          },
        ],
        from: { email: from || this.defaultFrom },
        template_id: templateId,
      };

      const response = await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        message,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 202) {
        return JSON.stringify({
          success: true,
          message: "Template email sent successfully",
        });
      } else {
        throw new Error(`SendGrid API returned status code: ${response.status}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `SendGrid API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`SendGrid error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in SendGrid operation");
    }
  }
}

/**
 * SendGridContactsTool - A tool for managing contacts in SendGrid
 */
export class SendGridContactsTool extends Tool {
  name = "sendgrid_contacts";
  description = "A tool for managing contacts in SendGrid. Input should be a JSON string with 'operation' (add, update, delete, get), 'contacts' array for add/update, 'email' for get/delete.";
  
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { operation, contacts, email, listIds } = params;

      if (!operation) {
        throw new Error("'operation' field is required");
      }

      switch (operation.toLowerCase()) {
        case "add":
          return await this.addContacts(contacts, listIds);
        case "update":
          return await this.updateContacts(contacts);
        case "delete":
          return await this.deleteContact(email);
        case "get":
          return await this.getContact(email);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `SendGrid API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`SendGrid error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in SendGrid operation");
    }
  }

  private async addContacts(contacts: any[], listIds?: string[]): Promise<string> {
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error("'contacts' array is required for add operation");
    }

    const payload: any = { contacts };
    if (listIds && Array.isArray(listIds) && listIds.length > 0) {
      payload.list_ids = listIds;
    }

    const response = await axios.put(
      "https://api.sendgrid.com/v3/marketing/contacts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async updateContacts(contacts: any[]): Promise<string> {
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error("'contacts' array is required for update operation");
    }

    const response = await axios.patch(
      "https://api.sendgrid.com/v3/marketing/contacts",
      { contacts },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async deleteContact(email: string): Promise<string> {
    if (!email) {
      throw new Error("'email' is required for delete operation");
    }

    const response = await axios.delete(
      `https://api.sendgrid.com/v3/marketing/contacts?emails=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async getContact(email: string): Promise<string> {
    if (!email) {
      throw new Error("'email' is required for get operation");
    }

    const response = await axios.get(
      `https://api.sendgrid.com/v3/marketing/contacts/search/emails?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return JSON.stringify(response.data);
  }
}

/**
 * SendGridListsTool - A tool for managing contact lists in SendGrid
 */
export class SendGridListsTool extends Tool {
  name = "sendgrid_lists";
  description = "A tool for managing contact lists in SendGrid. Input should be a JSON string with 'operation' (create, get, update, delete, add_contacts, remove_contacts), 'name' for create, 'id' for others.";
  
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { operation, id, name, contacts } = params;

      if (!operation) {
        throw new Error("'operation' field is required");
      }

      switch (operation.toLowerCase()) {
        case "create":
          return await this.createList(name);
        case "get":
          return await this.getList(id);
        case "update":
          return await this.updateList(id, name);
        case "delete":
          return await this.deleteList(id);
        case "add_contacts":
          return await this.addContactsToList(id, contacts);
        case "remove_contacts":
          return await this.removeContactsFromList(id, contacts);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `SendGrid API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`SendGrid error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in SendGrid operation");
    }
  }

  private async createList(name: string): Promise<string> {
    if (!name) {
      throw new Error("'name' is required for create operation");
    }

    const response = await axios.post(
      "https://api.sendgrid.com/v3/marketing/lists",
      { name },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async getList(id: string): Promise<string> {
    if (!id) {
      throw new Error("'id' is required for get operation");
    }

    const response = await axios.get(
      `https://api.sendgrid.com/v3/marketing/lists/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async updateList(id: string, name: string): Promise<string> {
    if (!id) {
      throw new Error("'id' is required for update operation");
    }

    if (!name) {
      throw new Error("'name' is required for update operation");
    }

    const response = await axios.patch(
      `https://api.sendgrid.com/v3/marketing/lists/${id}`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async deleteList(id: string): Promise<string> {
    if (!id) {
      throw new Error("'id' is required for delete operation");
    }

    const response = await axios.delete(
      `https://api.sendgrid.com/v3/marketing/lists/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async addContactsToList(id: string, contacts: string[]): Promise<string> {
    if (!id) {
      throw new Error("'id' is required for add_contacts operation");
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error("'contacts' array is required for add_contacts operation");
    }

    const response = await axios.post(
      `https://api.sendgrid.com/v3/marketing/lists/${id}/contacts`,
      { contact_ids: contacts },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.stringify(response.data);
  }

  private async removeContactsFromList(id: string, contacts: string[]): Promise<string> {
    if (!id) {
      throw new Error("'id' is required for remove_contacts operation");
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error("'contacts' array is required for remove_contacts operation");
    }

    const response = await axios.delete(
      `https://api.sendgrid.com/v3/marketing/lists/${id}/contacts`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        data: { contact_ids: contacts },
      }
    );

    return JSON.stringify(response.data);
  }
}
