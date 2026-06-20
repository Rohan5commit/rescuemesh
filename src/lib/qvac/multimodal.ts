// QVAC Multimodal Processing
import {
  loadModel,
  completion,
  unloadModel,
  transcribe,
} from '@qvac/sdk';
import { LLM_MODEL } from './models';

export async function analyzeImage(
  imageBase64: string,
  question: string
): Promise<string> {
  const modelId = await loadModel({
    modelSrc: LLM_MODEL,
    modelType: 'llm',
  });

  try {
    const result = completion({
      modelId,
      history: [
        {
          role: 'user',
          content: [
            { type: 'image', image: imageBase64 },
            { type: 'text', text: question },
          ],
        },
      ],
      stream: true,
      maxTokens: 1024,
    });

    let text = '';
    for await (const token of result.tokenStream) {
      text += token;
    }
    return text;
  } finally {
    await unloadModel({ modelId });
  }
}

export async function transcribeAudio(
  audioBuffer: ArrayBuffer
): Promise<string> {
  const result = await transcribe({
    audio: new Uint8Array(audioBuffer),
  });
  return result.text;
}

export async function describeImageForIncident(
  imageBase64: string
): Promise<string> {
  return analyzeImage(
    imageBase64,
    'Describe what you see in this image in the context of an emergency incident. Identify any hazards, damage, people, equipment, or safety concerns visible. Be specific and factual.'
  );
}
