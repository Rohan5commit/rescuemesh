# RescueMesh Evidence Bundle

## Submission Checklist

- [x] Working application (Tauri desktop)
- [x] GitHub repository with clean commit history
- [x] README with full documentation
- [x] Architecture documentation
- [x] Demo script (2-4 minutes)
- [x] Setup and reproducibility guides
- [x] Demo knowledge packs (fire, flood, medical, logistics)
- [x] Pre-built demo cases
- [x] Source evidence inspector
- [x] P2P sharing demonstration
- [x] Delegated compute demonstration
- [x] Export and reporting
- [x] MIT License

## Demo Materials

- `docs/demo-script.md` — Narrated demo flow
- `assets/demo-knowledge-packs/` — Pre-built knowledge packs
- `assets/demo-cases/` — Pre-built incident cases

## Technical Evidence

- All inference through QVAC SDK (`@qvac/sdk`)
- Zero cloud API calls
- Local RAG with QVAC embeddings
- P2P via loopback + real serialization (Hyperswarm in production)
- Delegated compute via real QVAC SDK delegate option


## Demo Mode Note

P2P and delegated compute features operate in demo mode (single-device):
- **P2P sharing** uses real serialization/deserialization over loopback transport
- **Delegated compute** uses real QVAC SDK delegate API with automatic local fallback
- Both features are fully functional in production mode with multiple devices
