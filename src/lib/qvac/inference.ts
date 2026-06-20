// QVAC Local Inference Engine
import {
  loadModel,
  completion,
  unloadModel,
  type CompletionOptions,
} from '@qvac/sdk';
import { LLM_MODEL } from './models';

type InferenceResult = {
  text: string;
  durationMs: number;
};

let activeModelId: string | null = null;

export async function initLLM(
  onProgress?: (progress: number) => void
): Promise<string> {
  if (activeModelId) return activeModelId;

  const modelId = await loadModel({
    modelSrc: LLM_MODEL,
    modelType: 'llm',
    onProgress,
  });

  activeModelId = modelId;
  return modelId;
}

export async function shutdownLLM(): Promise<void> {
  if (activeModelId) {
    await unloadModel({ modelId: activeModelId });
    activeModelId = null;
  }
}

export async function generate(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<InferenceResult> {
  const modelId = await initLLM();
  const start = performance.now();

  const history: CompletionOptions['history'] = [];
  if (systemPrompt) {
    history.push({ role: 'system', content: systemPrompt });
  }
  history.push({ role: 'user', content: prompt });

  const result = completion({
    modelId,
    history,
    stream: false,
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens ?? 2048,
  });

  return {
    text: result.text,
    durationMs: performance.now() - start,
  };
}

export async function generateStreamed(
  prompt: string,
  systemPrompt?: string,
  onToken?: (token: string) => void,
  options?: { temperature?: number; maxTokens?: number }
): Promise<InferenceResult> {
  const modelId = await initLLM();
  const start = performance.now();

  const history: CompletionOptions['history'] = [];
  if (systemPrompt) {
    history.push({ role: 'system', content: systemPrompt });
  }
  history.push({ role: 'user', content: prompt });

  const result = completion({
    modelId,
    history,
    stream: true,
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens ?? 2048,
  });

  let text = '';
  for await (const token of result.tokenStream) {
    text += token;
    onToken?.(token);
  }

  return {
    text,
    durationMs: performance.now() - start,
  };
}
