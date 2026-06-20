# RescueMesh Architecture

## System Overview

RescueMesh is a fully local-first desktop application built with Tauri 2 (React + TypeScript frontend, Rust backend). All AI inference, knowledge retrieval, and data storage happens on the user's device with zero cloud dependency.

```
┌─────────────────────────────────────────────┐
│           RescueMesh Desktop App            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Intake   │  │  Action  │  │  Export  │  │
│  │  Module   │  │  Engine  │  │  Module  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │        │
│  ┌────▼──────────────▼──────────────▼────┐  │
│  │         QVAC SDK Integration          │  │
│  │  ┌─────────┐ ┌──────┐ ┌───────────┐  │  │
│  │  │   LLM   │ │ Embed│ │Transcribe │  │  │
│  │  └─────────┘ └──────┘ └───────────┘  │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────┐  ┌───────────────────┐  │
│  │   Local RAG   │  │  Local Storage    │  │
│  │  (Ingestion,  │  │  (SQLite / JSON)  │  │
│  │   Retrieval)  │  │                   │  │
│  └───────────────┘  └───────────────────┘  │
│  ┌───────────────┐  ┌───────────────────┐  │
│  │ Delegated     │  │  P2P Sharing      │  │
│  │ Compute       │  │  (Holepunch)      │  │
│  └───────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────┘
```

## Local-Only Inference Path

1. User provides text/voice/image/PDF input
2. Input is normalized to structured case record
3. QVAC LLM (Llama 3.2 1B) generates assessment
4. QVAC embeddings (GTE Large) index knowledge packs
5. Local RAG retrieves relevant passages
6. LLM generates grounded action plans and answers
7. All outputs cite local evidence sources

## Local RAG Path

1. Documents are chunked into ~500-token segments
2. QVAC generates embeddings for each chunk
3. Embeddings are stored in workspace
4. Queries generate embeddings and compute cosine similarity
5. Top-K most similar chunks are retrieved
6. LLM generates answers grounded in retrieved context

## Multimodal Path

- **Text**: Direct input → case record
- **Voice**: Audio → QVAC transcribe → text case input
- **Image**: Image → QVAC vision model → description → case input
- **PDF/Document**: File → text extraction → RAG ingestion

## Delegated Compute Path

1. Device discovers nearby peers via Holepunch DHT
2. Heavier tasks (indexing, batch summarization) can be offloaded
3. Consumer loads model with `delegate` option pointing to provider's public key
4. QVAC handles the P2P inference routing
5. Fallback to local execution if peer unavailable

## P2P Sharing Path

1. Devices discover each other via Hyperswarm DHT
2. Knowledge packs (indexed documents) can be shared
3. Transfer is direct device-to-device
4. No central server involved
5. Model bundles can also be shared for offline distribution


## Demo Mode

In single-device demo mode, P2P and delegated compute operate over loopback:
- Peer discovery returns the local device + simulated LAN peers (clearly labeled)
- Knowledge pack transfers use the real serialization protocol over loopback
- Delegated compute attempts the real QVAC delegate API, falling back to local if unavailable

This exercises the full code path while acknowledging the single-device constraint.
