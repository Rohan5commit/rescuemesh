# RescueMesh Reproducibility Guide

## Steps for Judges

1. **Clone**: `git clone https://github.com/Rohan5commit/rescuemesh.git`
2. **Install**: `cd rescuemesh && npm install`
3. **Run**: `npm run tauri dev`
4. **Demo**: Follow `docs/demo-script.md`

## What to Verify

- [ ] App launches without internet connection
- [ ] Models download on first run (one-time, ~1.5GB)
- [ ] Incident creation and intake work
- [ ] Assessment generates locally (no API calls)
- [ ] RAG retrieves from local knowledge packs
- [ ] Q&A answers cite local evidence
- [ ] Export generates clean reports
- [ ] P2P scan discovers nearby devices
- [ ] Delegated compute offloads to peers

## Key Validation

- Open network inspector → No outbound requests after model download
- All inference tokens generated locally via QVAC SDK
- Knowledge pack data never leaves the device unless explicitly shared via P2P
