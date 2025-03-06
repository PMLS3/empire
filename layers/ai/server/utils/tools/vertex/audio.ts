import { VertexAI } from '@google-cloud/vertexai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

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

export async function generateSpeech(
  projectId: string,
  location: string,
  text: string,
  voiceName: string = 'en-US-Neural2-F',
  languageCode: string = 'en-US',
  speakingRate: number = 1.0,
  pitch: number = 0.0,
  volumeGainDb: number = 0.0,
  effectsProfileId: string[] = [],
  outputFormat: string = 'MP3'
) {
  // Create a client
  const client = new TextToSpeechClient();

  // Convert output format to proper enum value
  const audioEncoding = outputFormat === 'MP3' ? 'MP3' : 'LINEAR16';

  // Construct the request
  const request = {
    input: { text },
    voice: { 
      name: voiceName, 
      languageCode 
    },
    audioConfig: {
      audioEncoding,
      speakingRate,
      pitch,
      volumeGainDb,
      effectsProfileId
    },
  };

  try {
    // Call the Text-to-Speech API
    const [response] = await client.synthesizeSpeech(request);
    
    // The response's audioContent is Binary
    const audioContent = response.audioContent;
    
    // Convert binary to base64 for easy transport
    return Buffer.from(audioContent as Uint8Array).toString('base64');
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Function to get available voices
export async function listVoices(languageCode: string = '') {
  const client = new TextToSpeechClient();
  
  try {
    // Call the Text-to-Speech API
    const [response] = await client.listVoices({ languageCode });
    return response.voices;
  } catch (error) {
    console.error('Error listing voices:', error);
    throw error;
  }
}
