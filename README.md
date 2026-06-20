<div align="center">

# 🛡️ RescueMesh

**Offline Field-Operations AI Copilot for Emergency & Disaster Response Teams**

*QVAC Hackathon I — Unleash Edge AI*

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![QVAC SDK](https://img.shields.io/badge/QVAC-SDK-blue.svg)](https://www.npmjs.com/package/@qvac/sdk)
[![Local-First](https://img.shields.io/badge/Local-First-green.svg)]()

</div>

---

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
- ✅ **Speech Transcription** — via QVAC SDK
- ✅ **Image Analysis** — Multimodal via QVAC SDK
- ✅ **RAG System** — Local ingestion, chunking, retrieval
- ✅ **Vector Search** — Cosine similarity on-device
- ✅ **Knowledge Packs** — Emergency SOPs and protocols
- ✅ **P2P Sharing** — Holepunch DHT
- ✅ **Delegated Compute** — Offload to nearby peers

## How QVAC is Used

```typescript
import { loadModel, completion, ragIngest, ragSearch } from '@qvac/sdk';

// Load LLM for inference
const modelId = await loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0, modelType: 'llm' });

// Generate response
const result = completion({ modelId, history: [...], stream: true });

// Ingest knowledge into RAG
await ragIngest({ modelId, workspace: 'rescuemesh-rag', documents: [...] });

// Search for relevant evidence
const results = await ragSearch({ modelId, workspace: 'rescuemesh-rag', query: '...', topK: 5 });
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
- Demo includes simulated voice transcription and image analysis

## Future Work

- Real-time voice capture with on-device STT
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
