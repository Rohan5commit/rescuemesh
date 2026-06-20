// Delegated Compute — offload heavier tasks to nearby peers
import { loadModel, completion, unloadModel } from '@qvac/sdk';
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

// Simulate delegated compute via QVAC P2P
export async function executeOnPeer(
  task: ComputeTask,
  peer: PeerDevice
): Promise<string> {
  // In production, this uses QVAC's delegate option:
  // const modelId = await loadModel({
  //   modelSrc: LLM_MODEL,
  //   delegate: { providerPublicKey: peer.publicKey, fallbackToLocal: true }
  // });
  // For demo, simulate the delegation
  const idx = computeTasks.findIndex((t) => t.id === task.id);
  if (idx !== -1) computeTasks[idx].status = 'running';

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const result = \`[Delegated to ${peer.name}] Processed: ${task.type} task. Result: Task completed on peer device with compute resources. The heavier ${task.type} workload was offloaded to preserve local resources.\`;

  if (idx !== -1) {
    computeTasks[idx].status = 'completed';
    computeTasks[idx].result = result;
    computeTasks[idx].completedAt = new Date().toISOString();
  }

  return result;
}

// Simulate local execution for comparison
export async function executeLocally(task: ComputeTask): Promise<string> {
  const idx = computeTasks.findIndex((t) => t.id === task.id);
  if (idx !== -1) computeTasks[idx].status = 'running';

  const modelId = await loadModel({
    modelSrc: (await import('../qvac/models')).LLM_MODEL,
    modelType: 'llm',
  });

  try {
    const result = completion({
      modelId,
      history: [{ role: 'user', content: task.payload }],
      stream: false,
      maxTokens: 512,
    });

    let text = '';
    for await (const token of result.tokenStream) {
      text += token;
    }

    if (idx !== -1) {
      computeTasks[idx].status = 'completed';
      computeTasks[idx].result = text;
      computeTasks[idx].completedAt = new Date().toISOString();
    }
    return text;
  } finally {
    await unloadModel({ modelId });
  }
}

export function clearCompletedTasks(): void {
  computeTasks = computeTasks.filter((t) => t.status !== 'completed');
}
