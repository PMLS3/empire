import { VertexAI } from '@google-cloud/vertexai';

/**
 * TODO(developer): Update these variables before running the sample.
 */
export async function analyze_pdf(projectId = 'PROJECT_ID', location = 'us-central1', model = 'gemini-1.5-flash-001', url: string, question = 'Extract the structured data from the following PDF file', schema = '') {
  if (!url || !url.includes('.pdf')) {
    throw new Error('Invalid URL: URL must point to a PDF file.');
  }

  const vertexAI = new VertexAI({ project: projectId, location: location });
  // const schema = JSON.parse(schema);
  const generativeModel = vertexAI.getGenerativeModel({
    model: model,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const filePart = {
    file_data: {
      file_uri: url,
      mime_type: 'application/pdf',
    },
  };
  const textPart = {
    text: `
    You are a very professional document summarization specialist.
    Please summarize the given document.`,
  };

  console.log({ filePart, textPart });

  const request: any = {
    contents: [{ role: 'user', parts: [filePart, textPart] }],
  };

  try {
    const resp = await generativeModel.generateContent(request);
    const contentResponse = await resp.response;
    console.log(JSON.stringify(contentResponse));
    return contentResponse;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`VertexAI.ClientError: ${error.message}`);
  }
}
