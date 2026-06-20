// QVAC Multimodal Processing
//
// Uses the singleton LLM model from inference.ts (via initLLM)
// instead of loading/unloading per-call. This avoids:
//   - Redundant model loads (~1.5GB each)
//   - Race conditions with concurrent inference calls
//   - Memory pressure from repeated load/unload cycles

import { completion, transcribe } from '@qvac/sdk';
import { initLLM } from './inference';

/**
 * Analyze an image with a question using the shared LLM model.
 *
 * Reuses the singleton activeModelId from inference.ts via initLLM().
 * The model is loaded once and shared across all inference calls.
 */
export async function analyzeImage(
  imageBase64: string,
  question: string
): Promise<string> {
  const modelId = await initLLM();

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
}

/**
 * Transcribe audio to text using QVAC's whisper-based transcriber.
 *
 * Accepts an ArrayBuffer of audio data (e.g. from MediaRecorder).
 * The QVAC SDK's transcribe() handles format conversion internally.
 */
export async function transcribeAudio(
  audioBuffer: ArrayBuffer
): Promise<string> {
  const result = await transcribe({
    audio: new Uint8Array(audioBuffer),
  });
  return result.text;
}

/**
 * Describe an image in the context of an emergency incident.
 */
export async function describeImageForIncident(
  imageBase64: string
): Promise<string> {
  return analyzeImage(
    imageBase64,
    'Describe what you see in this image in the context of an emergency incident. Identify any hazards, damage, people, equipment, or safety concerns visible. Be specific and factual.'
  );
}
