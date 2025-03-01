import { Tool } from "@langchain/core/tools";
import { VertexAI } from "@google-cloud/vertexai";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { sendMultiModalPromptWithImage } from "./vertex/image";
import { summarize_audio, transcript_audio } from "./vertex/audio";
import { sendMultiModalPromptWithVideo, analyze_video_with_audio } from "./vertex/video";
import { analyze_pdf } from "./vertex/documents";

// Helper function to get base64 from file
async function getBase64FromFile(filepath: string) {
  try {
    const data = await fs.readFile(filepath);
    return data.toString("base64");
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error);
    throw new Error(`Failed to read file ${filepath}`);
  }
}

export class VertexImageAnalysisTool extends Tool {
  name = "vertex_image_analysis";
  description = "A tool for analyzing images using Google Vertex AI. Input should be a JSON string with 'filepaths' (array of image file paths) and 'query' (what to analyze about the images).";
  
  private projectId: string;
  private location: string;
  private model: string;

  constructor(projectId: string, location: string = "us-central1", model: string = "gemini-1.5-flash-001") {
    super();
    this.projectId = projectId;
    this.location = location;
    this.model = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { filepaths, query } = params;

      if (!filepaths || !Array.isArray(filepaths) || filepaths.length === 0) {
        throw new Error("Image filepaths array is required");
      }

      if (!query) {
        throw new Error("Query is required");
      }

      // Validate file paths
      for (const filepath of filepaths) {
        const exists = await fs.access(filepath).then(() => true).catch(() => false);
        if (!exists) {
          throw new Error(`File not found: ${filepath}`);
        }
      }

      const result = await sendMultiModalPromptWithImage(
        this.projectId,
        this.location,
        this.model,
        filepaths,
        query
      );

      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Vertex image analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Vertex image analysis');
    }
  }
}

export class VertexAudioAnalysisTool extends Tool {
  name = "vertex_audio_analysis";
  description = "A tool for analyzing audio using Google Vertex AI. Input should be a JSON string with 'url' (audio file URL) and 'type' ('summary' or 'transcript').";
  
  private projectId: string;
  private location: string;
  private model: string;

  constructor(projectId: string, location: string = "us-central1", model: string = "gemini-1.5-flash-001") {
    super();
    this.projectId = projectId;
    this.location = location;
    this.model = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { url, type = "summary" } = params;

      if (!url) {
        throw new Error("Audio URL is required");
      }

      if (type === "summary") {
        const result = await summarize_audio(this.projectId, this.location, this.model, url);
        return JSON.stringify(result);
      } else if (type === "transcript") {
        const result = await transcript_audio(this.projectId, this.location, this.model, url);
        return JSON.stringify(result);
      } else {
        throw new Error("Invalid type. Must be 'summary' or 'transcript'");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Vertex audio analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Vertex audio analysis');
    }
  }
}

export class VertexVideoAnalysisTool extends Tool {
  name = "vertex_video_analysis";
  description = "A tool for analyzing videos using Google Vertex AI. Input should be a JSON string with 'url' (video file URL) and 'type' ('description' or 'analysis').";
  
  private projectId: string;
  private location: string;
  private model: string;

  constructor(projectId: string, location: string = "us-central1", model: string = "gemini-1.5-flash-001") {
    super();
    this.projectId = projectId;
    this.location = location;
    this.model = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { url, type = "description" } = params;

      if (!url) {
        throw new Error("Video URL is required");
      }

      if (type === "description") {
        const result = await sendMultiModalPromptWithVideo(this.projectId, this.location, this.model, url);
        return result || "No description available";
      } else if (type === "analysis") {
        const result = await analyze_video_with_audio(this.projectId, this.location, this.model, url);
        return JSON.stringify(result);
      } else {
        throw new Error("Invalid type. Must be 'description' or 'analysis'");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Vertex video analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Vertex video analysis');
    }
  }
}

export class VertexDocumentAnalysisTool extends Tool {
  name = "vertex_document_analysis";
  description = "A tool for analyzing documents using Google Vertex AI. Input should be a JSON string with 'url' (document file URL).";
  
  private projectId: string;
  private location: string;
  private model: string;

  constructor(projectId: string, location: string = "us-central1", model: string = "gemini-1.5-flash-001") {
    super();
    this.projectId = projectId;
    this.location = location;
    this.model = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { url } = params;

      if (!url) {
        throw new Error("Document URL is required");
      }

      const result = await analyze_pdf(this.projectId, this.location, this.model, url);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Vertex document analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Vertex document analysis');
    }
  }
}

export class VertexMultiModalChatTool extends Tool {
  name = "vertex_multimodal_chat";
  description = "A tool for having multimodal conversations with Google Vertex AI. Input should be a JSON string with 'messages' (array of message objects with 'role' and 'content'), 'images' (optional array of image file paths), and 'videos' (optional array of video URLs).";
  
  private projectId: string;
  private location: string;
  private model: string;
  private vertexAI: VertexAI;
  private conversations: Map<string, any[]>;

  constructor(projectId: string, location: string = "us-central1", model: string = "gemini-1.5-pro") {
    super();
    this.projectId = projectId;
    this.location = location;
    this.model = model;
    this.vertexAI = new VertexAI({ project: projectId, location: location });
    this.conversations = new Map();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { messages, images = [], videos = [], chat_id } = params;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error("Messages array is required");
      }

      // Get or create conversation history
      let conversation: any[] = [];
      
      if (chat_id && this.conversations.has(chat_id)) {
        conversation = this.conversations.get(chat_id) || [];
      }

      // Process images if provided
      const imagePromises = images.map(async (imagePath: string) => {
        const base64 = await getBase64FromFile(imagePath);
        return {
          inlineData: {
            data: base64,
            mimeType: "image/jpeg", // Assuming JPEG, adjust as needed
          },
        };
      });

      const imageContents = await Promise.all(imagePromises);

      // Create the generative model
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: this.model,
      });

      // Prepare the request
      const parts: any[] = [];

      // Add images if available
      if (imageContents.length > 0) {
        parts.push(...imageContents);
      }

      // Add videos if available
      if (videos.length > 0) {
        for (const videoUrl of videos) {
          parts.push({
            fileData: {
              fileUri: videoUrl,
              mimeType: "video/mp4", // Assuming MP4, adjust as needed
            },
          });
        }
      }

      // Add the text message
      const lastMessage = messages[messages.length - 1];
      parts.push({ text: lastMessage.content });

      // Add the message to the request
      const request = {
        contents: [
          ...conversation,
          {
            role: lastMessage.role === "user" ? "user" : "model",
            parts: parts,
          },
        ],
      };

      // Generate content
      const response = await generativeModel.generateContent(request);
      const aggregatedResponse = await response.response;
      
      // Extract the response text
      const fullTextResponse = aggregatedResponse.candidates?.[0]?.content?.parts
        ? aggregatedResponse.candidates[0].content.parts
            .map((part: any) => part.text || "")
            .join("\n")
            .trim()
        : "No response generated";

      // Update conversation history
      conversation.push({
        role: lastMessage.role === "user" ? "user" : "model",
        parts: parts,
      });
      
      conversation.push({
        role: "model",
        parts: [{ text: fullTextResponse }],
      });

      // Generate a new chat ID if not provided
      const newChatId = chat_id || `chat_${Date.now()}`;
      
      // Store updated conversation
      this.conversations.set(newChatId, conversation);

      return JSON.stringify({
        chat_id: newChatId,
        response: fullTextResponse,
        conversation_length: conversation.length
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Vertex multimodal chat error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Vertex multimodal chat');
    }
  }
}
