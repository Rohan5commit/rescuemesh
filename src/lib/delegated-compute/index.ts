// Delegated Compute — offload heavier tasks to nearby peers
//
// Architecture:
//   - Uses QVAC SDK's native `delegate` option in loadModel()
//   - When delegate is specified, QVAC routes inference to the remote peer
//   - Falls back to local execution if the peer is unavailable
//
// DEMO MODE: When no real peers are available, the system attempts
// to use the QVAC delegate API and falls back to local execution.
// The delegation logic is real; the peer availability is simulated.

import { loadModel, completion, unloadModel } from '@qvac/sdk';
import { LLM_MODEL } from '../qvac/models';
import type { ComputeTask, PeerDevice } from '../schemas';
import { v4 as uuid } from 'uuid';

let computeTasks: ComputeTask[] = [];

export function getComputeTasks(): ComputeTask[] {
  return [...computeTasks];
}

export function createComputeTask(
  type: ComputeTask['type'],
  payload: string
): ComputeTask {
  const task: ComputeTask = {
    id: uuid(),
    type,
    status: 'pending',
    payload,
    createdAt: new Date().toISOString(),
    isLocal: true,
  };
  computeTasks.push(task);
  return task;
}

export function delegateTask(taskId: string, peer: PeerDevice): ComputeTask | undefined {
  const idx = computeTasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return undefined;
  computeTasks[idx] = {
    ...computeTasks[idx],
    status: 'delegated',
    assignedTo: peer.id,
    isLocal: false,
  };
  return computeTasks[idx];
}

/**
 * Execute a compute task on a remote peer via QVAC delegation.
 *
 * This uses the REAL QVAC SDK delegate option:
 *   loadModel({ modelSrc, delegate: { providerPublicKey, fallbackToLocal } })
 *
 * When the remote peer is unavailable, QVAC automatically falls back
 * to local execution (if fallbackToLocal: true).
 *
 * DEMO MODE: If the delegate API is not available in the current
 * QVAC SDK version, falls back to local execution with a note.
 */
export async function executeOnPeer(
  task: ComputeTask,
  peer: PeerDevice
): Promise<string> {
  const idx = computeTasks.findIndex((t) => t.id === task.id);
  if (idx !== -1) computeTasks[idx].status = 'running';

  const startTime = Date.now();

  try {
    // Attempt real QVAC delegation
    // The delegate option tells QVAC to route inference to the peer's
    // compute provider. If the peer is unreachable, it falls back locally.
    const modelId = await loadModel({
      modelSrc: LLM_MODEL,
      modelType: 'llm',
      delegate: {
        providerPublicKey: peer.publicKey,
        fallbackToLocal: true,
      },
    });

    try {
      const result = completion({
        modelId,
        history: [{ role: 'user', content: task.payload }],
        stream: true,
        maxTokens: 512,
      });

      let text = '';
      for await (const token of result.tokenStream) {
        text += token;
      }

      const elapsed = Date.now() - startTime;
      const delegationNote = peer.status === 'available'
        ? `Delegated to ${peer.name} via QVAC delegate API`
        : `Attempted delegation to ${peer.name}, fell back to local execution`;

      const resultText = `[${delegationNote} — ${elapsed}ms] ${text}`;

      if (idx !== -1) {
        computeTasks[idx].status = 'completed';
        computeTasks[idx].result = resultText;
        computeTasks[idx].completedAt = new Date().toISOString();
      }
      return resultText;
    } finally {
      await unloadModel({ modelId });
    }
  } catch (err) {
    // QVAC delegate API may not be available — fall back to local
    console.warn('QVAC delegate unavailable, falling back to local execution:', err);
    return executeLocally(task);
  }
}

/**
 * Execute a compute task locally on this device.
 * Uses QVAC SDK directly without delegation.
 */
export async function executeLocally(task: ComputeTask): Promise<string> {
  const idx = computeTasks.findIndex((t) => t.id === task.id);
  if (idx !== -1) computeTasks[idx].status = 'running';

  const startTime = Date.now();

  const modelId = await loadModel({
    modelSrc: LLM_MODEL,
    modelType: 'llm',
  });

  try {
    const result = completion({
      modelId,
      history: [{ role: 'user', content: task.payload }],
      stream: true,
      maxTokens: 512,
    });

    let text = '';
    for await (const token of result.tokenStream) {
      text += token;
    }

    const elapsed = Date.now() - startTime;
    const resultText = `[Local execution — ${elapsed}ms] ${text}`;

    if (idx !== -1) {
      computeTasks[idx].status = 'completed';
      computeTasks[idx].result = resultText;
      computeTasks[idx].completedAt = new Date().toISOString();
    }
    return resultText;
  } finally {
    await unloadModel({ modelId });
  }
}

export function clearCompletedTasks(): void {
  computeTasks = computeTasks.filter((t) => t.status !== 'completed');
}

/**
 * Start this device as a QVAC compute provider.
 *
 * In production, this registers the device with Hyperswarm so other
 * devices can discover it and delegate compute tasks.
 *
 * DEMO MODE: Logs the provider registration. Real implementation
 * requires Hyperswarm integration and QVAC provider API support.
 */
export async function startQVACProvider(options?: {
  allowedKeys?: string[];
  maxConcurrent?: number;
}): Promise<{ publicKey: string; status: string }> {
  // In production:
  // return await qvac.startProvider({
  //   firewall: { allowedKeys: options?.allowedKeys ?? [] },
  //   maxConcurrent: options?.maxConcurrent ?? 2,
  // });

  console.warn('startQVACProvider: demo mode — provider registration simulated');
  return {
    publicKey: `ed25519:${uuid().replace(/-/g, '').slice(0, 32)}`,
    status: 'registered (demo mode)',
  };
}

/**
 * Stop the QVAC compute provider.
 */
export async function stopQVACProvider(): Promise<void> {
  // In production: await qvac.stopProvider();
  console.warn('stopQVACProvider: demo mode — provider stopped (simulated)');
}
