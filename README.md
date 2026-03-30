<p align="center">
  <img src="https://img.shields.io/badge/CloudNexus-v1.0.0-3B82F6?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Telegram-MTProto-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="License" />
</p>

# CloudNexus

**Your Infinite Cloud. Your Command Center.**

CloudNexus is a personal cloud storage Progressive Web App (PWA) that transforms Telegram's infrastructure into a full-fledged personal cloud operating system. Upload, organize, stream, and encrypt your files using Telegram's unlimited storage as the backend — all from a futuristic command center interface.

---

## Features

### Six Dedicated Modules

| Module | Description |
|--------|-------------|
| **File Manager** | Full-featured file & folder management with grid/list views, drag & drop, search, bulk operations, and trash |
| **Gallery** | Photo & video browsing with masonry grid, timeline view, albums, lightbox viewer, and auto-backup |
| **Video Player** | Stream videos directly from Telegram with custom controls, subtitles, PiP, and resume playback |
| **Music Player** | Full music library with background playback, queue management, mini player, and Media Session API |
| **Transfer Manager** | Centralized upload/download hub with pause/resume, priority queue, and auto-retry |
| **Vault** | Client-side AES-256-GCM encrypted storage with passphrase protection and auto-lock |

### Core Capabilities

- **Unlimited Storage** via Telegram's MTProto API (your own account)
- **Streaming Playback** for video and music without full download
- **Client-Side Encryption** (AES-256-GCM) for sensitive files
- **Offline-First Architecture** with IndexedDB and Service Workers
- **Zero Backend Cost** — runs entirely client-side
- **Dual Theme** — Dark (command center) and Light themes
- **PWA** — Installable, works offline, share target support
- **Chunked Uploads** — Files over 2GB are automatically split and reassembled

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Static Export) |
| Language | TypeScript (Strict Mode) |
| Telegram API | GramJS (MTProto in browser) |
| Database | Dexie.js (IndexedDB) |
| Encryption | Web Crypto API (AES-256-GCM + PBKDF2) |
| State | Zustand |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Media | HTML5 Video/Audio + Media Session API |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Telegram Account**
- **Telegram API Credentials** from [my.telegram.org](https://my.telegram.org)

### Installation

```bash
# Clone the repository
git clone https://github.com/subramanyaSgb/CloudNexus.git
cd CloudNexus

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### First-Time Setup

1. Enter your **API ID** and **API Hash** from [my.telegram.org](https://my.telegram.org)
2. Enter your **phone number** (with country code)
3. Enter the **verification code** from Telegram
4. (Optional) Enter your **2FA password** if enabled

CloudNexus will automatically create 6 private channels in your Telegram account:

| Channel | Purpose |
|---------|---------|
| `CloudNexus Files` | General file storage |
| `CloudNexus Photos` | Photo backups |
| `CloudNexus Videos` | Video storage |
| `CloudNexus Music` | Music library |
| `CloudNexus Vault` | Encrypted files |
| `CloudNexus Meta` | Metadata index backup |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build (static export) |
| `npm run start` | Serve production build |
| `npm test` | Run all tests |
| `npm run lint` | ESLint (zero warnings mode) |
| `npm run typecheck` | TypeScript type check |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router (9 routes)
│   ├── files/            # File Manager
│   ├── gallery/          # Gallery
│   ├── videos/           # Video Player
│   ├── music/            # Music Player
│   ├── transfers/        # Transfer Manager
│   ├── vault/            # Encrypted Vault
│   └── settings/         # Settings & About
├── components/
│   ├── ui/               # Shared primitives (Button, Modal, Card, etc.)
│   ├── layout/           # App shell, sidebar, topbar, auth
│   ├── files/            # File Manager components
│   ├── gallery/          # Gallery components
│   ├── video/            # Video Player components
│   ├── music/            # Music Player components
│   ├── transfers/        # Transfer Manager components
│   └── vault/            # Vault components
├── lib/
│   ├── telegram/         # GramJS client, auth, channels, upload/download
│   ├── crypto/           # AES-256-GCM encryption, PBKDF2 key derivation
│   ├── db/               # Dexie.js schema, CRUD operations, cache
│   └── utils/            # Logger, formatting, MIME detection, chunking
├── stores/               # Zustand stores (auth, files, transfers, player, etc.)
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

---

## Architecture

### Channel-as-Bucket Pattern

Instead of dumping files into Saved Messages, CloudNexus creates dedicated private channels as storage buckets — each acting as an independent drive partition.

### File Chunking

- **Files <= 2GB**: Single message upload
- **Files > 2GB**: Split into 1.9GB chunks, linked via shared `groupId`

### Streaming

Video and music stream directly from Telegram using range-based downloads and the MediaSource API — no full download required.

### Encryption (Vault)

```
Passphrase → PBKDF2 (100K iterations) → Master Key
Master Key + Random IV → AES-256-GCM → Encrypted file
IV stored locally, key in memory only, passphrase never stored
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — click Deploy

### Any Static Host

```bash
npm run build
# Output in /out/ directory — deploy anywhere
```

Works on Vercel, Cloudflare Pages, Netlify, GitHub Pages, or any static file server.

---

## Design

**Futuristic Command Center** aesthetic with dual theme support:

- **Dark Theme**: Deep space black (`#0A0E17`) with electric blue accents (`#3B82F6`)
- **Light Theme**: Clean slate (`#F8FAFC`) with deep blue accents (`#2563EB`)
- **Typography**: Inter (body) + JetBrains Mono (technical data)
- **Motion**: Purposeful animations (150ms hover, 250ms transitions, skeleton shimmer)
- **Icons**: Lucide React — consistent minimal stroke style

---

## Security

- All encryption happens **client-side** — nothing sensitive touches a server
- Passphrase is **never stored** — derived each session via PBKDF2
- Per-file unique IV ensures identical files produce different ciphertext
- Vault files are **irrecoverable** without the passphrase (by design)
- No backend, no server, no third-party APIs beyond Telegram

---

## Author

**Subramanya GB**

---

## License

MIT License. See [LICENSE](LICENSE) for details.
