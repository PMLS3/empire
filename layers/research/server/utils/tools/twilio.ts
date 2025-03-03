import { Tool } from "@langchain/core/tools";
import axios from "axios";

/**
 * TwilioSMSTool - A tool for sending SMS messages using Twilio
 */
export class TwilioSMSTool extends Tool {
  name = "twilio_sms";
  description = "A tool for sending SMS messages using Twilio. Input should be a JSON string with 'to', 'body', and optional 'from' fields.";
  
  private accountSid: string;
  private authToken: string;
  private defaultFrom: string;

  constructor(accountSid: string, authToken: string, defaultFrom: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.defaultFrom = defaultFrom;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { to, body, from } = params;

      if (!to) {
        throw new Error("'to' field is required");
      }

      if (!body) {
        throw new Error("'body' field is required");
      }

      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("Body", body);
      formData.append("From", from || this.defaultFrom);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        formData,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return JSON.stringify({
        success: true,
        message: "SMS sent successfully",
        sid: response.data.sid,
        status: response.data.status,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Twilio API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`Twilio error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in Twilio SMS operation");
    }
  }
}

/**
 * TwilioWhatsAppTool - A tool for sending WhatsApp messages using Twilio
 */
export class TwilioWhatsAppTool extends Tool {
  name = "twilio_whatsapp";
  description = "A tool for sending WhatsApp messages using Twilio. Input should be a JSON string with 'to', 'body', and optional 'from' and 'mediaUrl' fields.";
  
  private accountSid: string;
  private authToken: string;
  private defaultFrom: string;

  constructor(accountSid: string, authToken: string, defaultFrom: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.defaultFrom = defaultFrom;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { to, body, from, mediaUrl } = params;

      if (!to) {
        throw new Error("'to' field is required");
      }

      if (!body) {
        throw new Error("'body' field is required");
      }

      // Format WhatsApp numbers
      const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
      const formattedFrom = (from || this.defaultFrom).startsWith("whatsapp:")
        ? (from || this.defaultFrom)
        : `whatsapp:${from || this.defaultFrom}`;

      const formData = new URLSearchParams();
      formData.append("To", formattedTo);
      formData.append("Body", body);
      formData.append("From", formattedFrom);
      
      if (mediaUrl) {
        formData.append("MediaUrl", mediaUrl);
      }

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        formData,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return JSON.stringify({
        success: true,
        message: "WhatsApp message sent successfully",
        sid: response.data.sid,
        status: response.data.status,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Twilio API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`Twilio error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in Twilio WhatsApp operation");
    }
  }
}

/**
 * TwilioVoiceTool - A tool for making phone calls using Twilio
 */
export class TwilioVoiceTool extends Tool {
  name = "twilio_voice";
  description = "A tool for making phone calls using Twilio. Input should be a JSON string with 'to', 'twiml' or 'url', and optional 'from' fields.";
  
  private accountSid: string;
  private authToken: string;
  private defaultFrom: string;

  constructor(accountSid: string, authToken: string, defaultFrom: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.defaultFrom = defaultFrom;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { to, from, twiml, url, method, statusCallback, statusCallbackMethod, fallbackUrl, fallbackMethod } = params;

      if (!to) {
        throw new Error("'to' field is required");
      }

      if (!twiml && !url) {
        throw new Error("Either 'twiml' or 'url' field is required");
      }

      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("From", from || this.defaultFrom);
      
      if (twiml) {
        formData.append("Twiml", twiml);
      } else if (url) {
        formData.append("Url", url);
        if (method) {
          formData.append("Method", method);
        }
      }

      if (statusCallback) {
        formData.append("StatusCallback", statusCallback);
        if (statusCallbackMethod) {
          formData.append("StatusCallbackMethod", statusCallbackMethod);
        }
      }

      if (fallbackUrl) {
        formData.append("FallbackUrl", fallbackUrl);
        if (fallbackMethod) {
          formData.append("FallbackMethod", fallbackMethod);
        }
      }

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`,
        formData,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return JSON.stringify({
        success: true,
        message: "Call initiated successfully",
        sid: response.data.sid,
        status: response.data.status,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Twilio API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`Twilio error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in Twilio Voice operation");
    }
  }
}

/**
 * TwilioVerifyTool - A tool for phone verification using Twilio Verify
 */
export class TwilioVerifyTool extends Tool {
  name = "twilio_verify";
  description = "A tool for phone verification using Twilio Verify. Input should be a JSON string with 'operation' (start, check), 'to' for phone number, 'code' for verification code (check only).";
  
  private accountSid: string;
  private authToken: string;
  private serviceSid: string;

  constructor(accountSid: string, authToken: string, serviceSid: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.serviceSid = serviceSid;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { operation, to, code, channel, locale } = params;

      if (!operation) {
        throw new Error("'operation' field is required");
      }

      if (!to) {
        throw new Error("'to' field is required");
      }

      switch (operation.toLowerCase()) {
        case "start":
          return await this.startVerification(to, channel || "sms", locale);
        case "check":
          if (!code) {
            throw new Error("'code' field is required for check operation");
          }
          return await this.checkVerification(to, code);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Twilio API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`Twilio error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in Twilio Verify operation");
    }
  }

  private async startVerification(to: string, channel: string, locale?: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("Channel", channel);
    
    if (locale) {
      formData.append("Locale", locale);
    }

    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${this.serviceSid}/Verifications`,
      formData,
      {
        auth: {
          username: this.accountSid,
          password: this.authToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return JSON.stringify({
      success: true,
      message: "Verification started successfully",
      sid: response.data.sid,
      status: response.data.status,
    });
  }

  private async checkVerification(to: string, code: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("Code", code);

    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${this.serviceSid}/VerificationCheck`,
      formData,
      {
        auth: {
          username: this.accountSid,
          password: this.authToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return JSON.stringify({
      success: true,
      message: "Verification check completed",
      sid: response.data.sid,
      status: response.data.status,
      valid: response.data.status === "approved",
    });
  }
}

/**
 * TwilioLookupTool - A tool for looking up phone number information using Twilio Lookup
 */
export class TwilioLookupTool extends Tool {
  name = "twilio_lookup";
  description = "A tool for looking up phone number information using Twilio Lookup. Input should be a JSON string with 'phoneNumber' and optional 'type' (carrier, caller-name) fields.";
  
  private accountSid: string;
  private authToken: string;

  constructor(accountSid: string, authToken: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { phoneNumber, type } = params;

      if (!phoneNumber) {
        throw new Error("'phoneNumber' field is required");
      }

      let url = `https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(phoneNumber)}`;
      
      if (type) {
        url += `?Type=${encodeURIComponent(type)}`;
      }

      const response = await axios.get(url, {
        auth: {
          username: this.accountSid,
          password: this.authToken,
        },
      });

      return JSON.stringify({
        success: true,
        data: response.data,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Twilio API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error instanceof Error) {
        throw new Error(`Twilio error: ${error.message}`);
      }
      throw new Error("An unknown error occurred in Twilio Lookup operation");
    }
  }
}
