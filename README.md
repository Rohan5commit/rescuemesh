<div align="center">

# 🛡️ RescueMesh

**Offline Field-Operations AI Copilot for Emergency & Disaster Response Teams**

*QVAC Hackathon I — Unleash Edge AI*

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![QVAC SDK](https://img.shields.io/badge/QVAC-SDK-blue.svg)](https://www.npmjs.com/package/@qvac/sdk)
[![Local-First](https://img.shields.io/badge/Local-First-green.svg)]()

</div>

---
## Demo Mode Notice

RescueMesh runs as a **single-device local-first application** in demo mode. Some features are demonstrated with loopback or simulated peers to showcase the full architecture:

| Feature | Demo Mode | Production Mode |
|---------|-----------|------------------|
| LLM Inference | QVAC SDK (real) | QVAC SDK (real) |
| RAG Search | QVAC SDK (real) | QVAC SDK (real) |
| Image Analysis | QVAC SDK (real) | QVAC SDK (real) |
| Audio Transcription | Simulated (requires mic API) | Whisper via QVAC |
| P2P Sharing | Loopback + simulated LAN peers | Hyperswarm DHT |
| Delegated Compute | Falls back to local execution | QVAC delegate to remote peer |

## Architecture

![RescueMesh Architecture](assets/architecture.svg)

## Screenshots

> **Note:** Run `python3 capture_screenshots.py` while the app is running to capture these screenshots.
> Screenshots show the dark-themed Tauri desktop interface with sidebar navigation.

| Screen | Description |
|--------|-------------|
| | **Case Dashboard** — View and manage incident cases |
| | **Intake** — Add text, voice, image, and document inputs |
| | **Action Plan** — AI-generated priorities, steps, and safety warnings |
| | **Ask RescueMesh** — Grounded Q&A with source citations |
| | **Evidence Inspector** — Trace every recommendation to its source |
| | **P2P & Compute** — Peer discovery and delegated compute |
| | **Export** — Incident report, checklist, and handoff note |

All data serialization, protocol logic, and QVAC SDK integration is **real and functional**. The demo mode simply operates over loopback instead of a real network.



## What is RescueMesh?

RescueMesh is a **fully on-device** emergency response copilot that helps field teams capture incident data, query local emergency knowledge, generate step-by-step response plans, and share knowledge peer-to-peer — **without any cloud dependency**.

### Why Edge AI?

| Cloud AI | RescueMesh (Edge AI) |
|---|---|
| Fails when networks go down | Works in complete offline mode |
| Sends victim data to third parties | All data stays on-device |
| Dependent on external servers | Runs on consumer hardware |
| Rate-limited and costly | Unlimited local inference |
| No P2P capability | Shares knowledge via Holepunch DHT |

## What Runs Locally

- ✅ **LLM Inference** — Llama 3.2 1B (Q4) via QVAC SDK
- ✅ **Embeddings** — GTE Large (FP16) for RAG
- 🔄 **Speech Transcription** — via QVAC SDK (simulated in demo mode)
- ✅ **Image Analysis** — Multimodal via QVAC SDK
- ✅ **RAG System** — Local ingestion, chunking, retrieval
- ✅ **Vector Search** — Cosine similarity on-device
- ✅ **Knowledge Packs** — Emergency SOPs and protocols
- ✅ **P2P Sharing** — Loopback peer discovery + real serialization (Hyperswarm in production)
- ✅ **Delegated Compute** — Real QVAC delegate API + local fallback

## How QVAC is Used

RescueMesh exercises **7 distinct QVAC SDK capabilities** across 4 modules:

| SDK Feature | Function Used | Module | What It Does |
|---|---|---|---|---|
| **LLM Inference** | `loadModel` + `completion` | inference.ts | Streams Llama 3.2 1B responses with temperature control |
| **Singleton Model Management** | `loadModel` + `unloadModel` | inference.ts | Loads model once, reuses across all inference calls |
| **Embedding Generation** | `loadModel` (embedding) + `embed` | embeddings.ts | Generates 768-dim vectors via GTE Large FP16 |
| **Audio Transcription** | `transcribe` | multimodal.ts | Whisper-based speech-to-text from MediaRecorder output |
| **Image Analysis** | `completion` (multimodal) | multimodal.ts | Describes images using the shared LLM with vision context |
| **P2P Delegation** | `loadModel` (delegate option) | delegated-compute | Routes inference to remote peer with local fallback |
| **Batch Embeddings** | `embed` (batched) | embeddings.ts | Generates vectors for multiple document chunks at once |

```typescript
import { loadModel, completion, transcribe, embed, ragIngest, ragSearch } from '@qvac/sdk';

// 1. LLM Inference (singleton - loaded once, reused everywhere)
const modelId = await loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0, modelType: 'llm' });
const result = completion({ modelId, history: [...], stream: true });

// 2. Embeddings (separate singleton for vector generation)
const embId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embedding' });
const vectors = await embed({ modelId: embId, input: 'fire emergency procedure' });

// 3. Audio Transcription (MediaRecorder -> QVAC whisper)
const text = await transcribe({ audio: new Uint8Array(audioBuffer) });

// 4. Image Analysis (multimodal via shared LLM)
const desc = completion({ modelId, history: [{ role: 'user', content: [
  { type: 'image', image: base64 },
  { type: 'text', text: 'Describe hazards' }
]}], stream: true });

// 5. RAG Pipeline (ingest + search)
await ragIngest({ modelId, workspace: 'rescuemesh-rag', documents: [...] });
const evidence = await ragSearch({ modelId, workspace: 'rescuemesh-rag', query: '...', topK: 5 });

// 6. Delegated Compute (P2P inference routing)
const delegated = await loadModel({ modelSrc: LLAMA, delegate: {
  providerPublicKey: peerKey, fallbackToLocal: true
}});
```

## How Local RAG Works

1. **Ingest** — Documents are chunked into ~500-token segments
2. **Embed** — QVAC generates vector embeddings for each chunk
3. **Index** — Embeddings stored in local workspace
4. **Query** — User questions generate query embeddings
5. **Retrieve** — Cosine similarity finds top-K matches
6. **Generate** — LLM answers grounded in retrieved context

## How Delegated Compute Works

```typescript
import { startQVACProvider, loadModel } from '@qvac/sdk';

// Device A: Start as compute provider
await startQVACProvider({ firewall: { allowedConsumers: ['device-b-key'] } });

// Device B: Delegate heavier task to Device A
const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  delegate: { providerPublicKey: 'device-a-key', fallbackToLocal: true }
});
```

## How P2P Sharing Works

Uses the **Holepunch** stack (Hyperswarm DHT) for direct device-to-device transfer:

1. Devices discover each other via DHT
2. Knowledge packs (indexed documents) are shared directly
3. No relay server or cloud service involved
4. Model bundles can also be distributed peer-to-peer

## Setup

### Prerequisites

- Node.js 18+
- Rust toolchain (for Tauri)
- macOS, Linux, or Windows

### Install & Run

```bash
# Clone
git clone https://github.com/Rohan5commit/rescuemesh.git
cd rescuemesh

# Install dependencies
npm install

# Start development
npm run tauri dev
```

### Hardware Recommendations

| Component | Minimum | Recommended |
|---|---|---|
| RAM | 8 GB | 16 GB |
| CPU | 4-core | 8-core |
| GPU | None (CPU fallback) | 4GB+ VRAM |
| Storage | 2 GB free | 5 GB free |

## Demo Flow

See [`docs/demo-script.md`](docs/demo-script.md) for a complete 2-4 minute narrated demo.

**Quick Summary:**
1. Open app → Create incident case
2. Add text, voice, image, and document inputs
3. Run AI assessment (local QVAC inference)
4. Review generated action plan with safety warnings
5. Ask follow-up questions (grounded RAG Q&A)
6. Inspect source evidence for every recommendation
7. Demo P2P knowledge pack sharing
8. Demo delegated compute offloading
9. Export clean incident report

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | System overview and data flow |
| [Demo Script](docs/demo-script.md) | 2-4 minute narrated demo |
| [Setup](docs/setup.md) | Installation and configuration |
| [Reproducibility](docs/reproducibility.md) | Steps for judges to reproduce |
| [Evidence Bundle](docs/evidence-bundle.md) | Submission checklist |
| [Judging Hook](docs/judging-hook.md) | Why this proves edge AI works |
| [Credits](docs/credits.md) | Libraries, models, and acknowledgments |

## Limitations

- First run requires ~1.5GB download for QVAC models
- Inference speed depends on local hardware
- P2P requires nearby devices with the app running
- Delegated compute requires trust-based key exchange
- Voice transcription: MediaRecorder pipeline fully wired, requires QVAC whisper model for final output

## Future Work


- Camera integration for live incident documentation
- Offline maps integration
- Multi-language support for international teams
- Integration with IoT sensors (smoke detectors, weather stations)
- Encrypted P2P communication
- Plugin system for custom knowledge packs

## License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">

**Built for QVAC Hackathon I — Unleash Edge AI**

*All processing runs on-device. No cloud services used.*

</div>
