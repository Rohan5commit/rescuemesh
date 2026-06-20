// QVAC Model Constants
import {
  LLAMA_3_2_1B_INST_Q4_0,
  GTE_LARGE_FP16,
} from '@qvac/sdk';

export const LLM_MODEL = LLAMA_3_2_1B_INST_Q4_0;
export const EMBED_MODEL = GTE_LARGE_FP16;

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [LLAMA_3_2_1B_INST_Q4_0]: 'Llama 3.2 1B (Q4)',
  [GTE_LARGE_FP16]: 'GTE Large Embeddings',
};
