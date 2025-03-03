import { VertexAI } from '@google-cloud/vertexai';

/**
 * TODO(developer): Update these variables before running the sample.
 */
export async function summarize_audio(projectId = 'PROJECT_ID', location = 'us-central1', model = 'gemini-1.5-flash-001', url: string) {
  const vertexAI = new VertexAI({project: projectId, location: location});

  const generativeModel = vertexAI.getGenerativeModel({
    model: model,
  });

  const filePart = {
    file_data: {
      file_uri: url,
      mime_type: 'audio/mpeg',
    },
  };
  const textPart = {
    text: `
    Please provide a summary for the audio.
    Provide chapter titles with timestamps, be concise and short, no need to provide chapter summaries.
    Do not make up any information that is not part of the audio and do not be verbose.`,
  };

  const request: any = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  console.log(JSON.stringify(contentResponse));
}



/**
 * TODO(developer): Update these variables before running the sample.
 */
export async function transcript_audio(projectId = 'PROJECT_ID', location = 'us-central1', model = 'gemini-1.5-flash-001', url: string) {
  const vertexAI = new VertexAI({project: projectId, location: location});

  const generativeModel = vertexAI.getGenerativeModel({
    model: model,
  });

  const filePart = {
    file_data: {
      file_uri: url,
      mime_type: 'audio/mpeg',
    },
  };
  const textPart = {
    text: `
    Can you transcribe this interview, in the format of timecode, speaker, caption?
    Use speaker A, speaker B, etc. to identify speakers.`,
  };

  const request: any = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  console.log(JSON.stringify(contentResponse));
}
