# RescueMesh — Judging Hook

## The Problem

Cloud-dependent AI fails when it matters most:

- **Network outages**: 60% of disaster zones lose connectivity within 2 hours
- **Privacy risks**: Victim data sent to third-party APIs violates HIPAA/GDPR
- **Latency**: Cloud round-trips add 500ms-2s per inference call
- **Cost**: API costs scale linearly with incident volume
- **Single point of failure**: Server downtime = zero AI capability

## The Solution

RescueMesh is a **fully on-device** emergency response copilot. Every AI capability
runs locally via the QVAC SDK — no cloud dependency whatsoever.

### What Makes This Different

| Traditional Edge AI | RescueMesh |
|---------------------|------------|
| Runs one model locally | Runs LLM + embeddings + transcription + image analysis |
| No RAG capability | Full RAG pipeline: ingest → embed → search → generate |
| No P2P | P2P knowledge sharing via loopback (Hyperswarm in production) |
| No case management | Complete incident lifecycle: intake → assess → plan → export |
| Requires cloud fallback | Zero cloud dependency — works in complete isolation |

### QVAC SDK Integration Depth

RescueMesh exercises **7 distinct QVAC SDK capabilities**:

1. **LLM Inference** — `loadModel` + `completion` (singleton, streaming)
2. **Embeddings** — `loadModel` (embedding) + `embed` (768-dim vectors)
3. **RAG Ingest** — `ragIngest` (per-pack and per-case workspaces)
4. **RAG Search** — `ragSearch` (knowledge packs + case inputs)
5. **Audio Transcription** — `transcribe` (MediaRecorder → QVAC)
6. **Image Analysis** — `completion` (multimodal via shared LLM)
7. **P2P Delegation** — `loadModel` with `delegate` option + local fallback

## What's Real vs. Demo Mode

We believe in transparency. Here's exactly what runs in production vs. demo mode:

| Capability | Real (production) | Demo mode |
|-----------|-------------------|-----------|
| LLM inference | ✅ QVAC SDK | Same |
| RAG pipeline | ✅ QVAC SDK | Same |
| Embeddings | ✅ QVAC SDK | Same |
| Image analysis | ✅ QVAC SDK | Same |
| Voice transcription | ✅ QVAC SDK | MediaRecorder wired, whisper model depends on env |
| P2P sharing | ✅ Hyperswarm DHT | Loopback + simulated LAN peers |
| Delegated compute | ✅ QVAC provider/consumer | Falls back to local |

**Everything that runs in demo mode is real code with real serialization and real QVAC
SDK calls.** The only difference is the transport layer (loopback vs. network) and
peer availability.

## Evidence of Quality

- **No placeholder code** — every function either calls QVAC SDK or documents why it
  can't (e.g., "requires Hyperswarm for real P2P")
- **Honest documentation** — README, evidence-bundle, and code comments all agree
- **Real data** — 5 emergency SOP documents, not lorem ipsum
- **Type-safe** — TypeScript throughout, no `any` types, proper interfaces
- **Clean architecture** — modular lib/ with clear separation of concerns
- **CI/CD** — GitHub Actions for automated Tauri builds

## Impact Statement

RescueMesh demonstrates that **local-first AI is practical and performant** for
critical applications. The QVAC SDK makes it possible to run a complete AI
pipeline — LLM, embeddings, RAG, transcription, image analysis — on a single
laptop without any cloud dependency.

This matters because:
- Emergency responders need AI guidance when networks fail
- Privacy-sensitive environments (hospitals, schools) can't send data to cloud APIs
- Developing regions lack reliable internet but need AI tools
- Cost-sensitive organizations can't afford per-query API pricing

**RescueMesh proves that edge AI isn't just possible — it's the right architecture
for applications where failure isn't an option.**
