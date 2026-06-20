# RescueMesh Setup Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Rust** toolchain (for Tauri)
- **Platform-specific dependencies**:
  - macOS: Xcode Command Line Tools
  - Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`
  - Windows: WebView2, Microsoft Visual C++ Build Tools

## Installation

```bash
# Clone the repository
git clone https://github.com/Rohan5commit/rescuemesh.git
cd rescuemesh

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

## First Run

On first launch, the app will:
1. Download QVAC models (~1.5GB for LLM + embeddings)
2. Initialize local storage
3. Show the landing screen

## Loading Demo Knowledge Packs

Click "New Case" to trigger automatic loading of pre-built knowledge packs for fire, flood, medical, and logistics scenarios.

## Hardware Recommendations

- **Minimum**: 8GB RAM, 4-core CPU
- **Recommended**: 16GB RAM, 8-core CPU, GPU with 4GB+ VRAM
- **Storage**: ~2GB free for models + knowledge packs
