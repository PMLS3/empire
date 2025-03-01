import { VertexAI } from '@google-cloud/vertexai';
import ffmpeg from 'fluent-ffmpeg';

export async function sendMultiModalPromptWithVideo(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001',
  videoUrl: string
) {
  const vertexAI = new VertexAI({ project: projectId, location: location });
  const generativeVisionModel = vertexAI.getGenerativeModel({ model: model });

  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: videoUrl,
              mimeType: 'video/mp4',
            },
          },
          {
            text: 'What is in the video?',
          },
        ],
      },
    ],
  };

  const response = await generativeVisionModel.generateContent(request);
  const aggregatedResponse = await response.response;
  const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text;

  return fullTextResponse;
}

export async function analyze_video_with_audio(projectId = 'PROJECT_ID', location = 'us-central1', model = 'gemini-1.5-flash-001', url: string) {
  const vertexAI = new VertexAI({ project: projectId, location: location });
  const generativeModel = vertexAI.getGenerativeModel({ model: model });

  const filePart = {
    file_data: {
      file_uri: url,
      mime_type: 'video/mp4',
    },
  };
  const textPart = {
    text: 'Provide a description of the video. The description should also contain anything important which people say in the video.',
  };

  const request: any = {
    contents: [{ role: 'user', parts: [filePart, textPart] }],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  return contentResponse;
}

