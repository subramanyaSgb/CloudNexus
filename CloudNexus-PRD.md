# CloudNexus — Product Requirements Document (PRD)

**Version:** 1.0
**Author:** Subramanya GB
**Date:** March 30, 2026
**Status:** Planning / Pre-Development
**Development Tool:** Claude Code

---

## 1. Executive Summary

**CloudNexus** is a personal, feature-rich cloud storage Progressive Web App (PWA) that leverages Telegram's MTProto API as its unlimited storage backend. It transforms Telegram's infrastructure into a full-fledged personal cloud operating system with dedicated experiences for file management, photo gallery, video playback, music streaming, encrypted vault storage, and a comprehensive transfer manager — all wrapped in a futuristic "command center" aesthetic with dual theme support.

**Tagline:** *"Your Infinite Cloud. Your Command Center."*

### 1.1 Problem Statement

Existing cloud storage solutions (Google Drive, OneDrive, Dropbox) impose storage limits and paid tiers. UnLim and similar apps offer Telegram-backed storage but with poor UX, limited media playback, no encryption, and no offline capabilities. There is no polished, PWA-based solution that treats Telegram as a true personal cloud backend with dedicated media experiences.

### 1.2 Solution

CloudNexus provides:

- **Unlimited storage** via Telegram's MTProto API (user's own account)
- **Six dedicated modules** — File Manager, Gallery, Video Player, Music Player, Transfer Manager, Vault
- **Streaming playback** — video and music stream directly from Telegram without full download
- **Client-side encryption** — AES-256-GCM encryption before upload for sensitive files
- **Offline-first architecture** — browse, queue uploads, and access cached files without internet
- **Zero backend cost** — runs entirely client-side; Telegram is the only backend

### 1.3 Target User

Personal use only — single user (Subramanya GB). No multi-tenant, no auth system beyond Telegram login.

---

## 2. Brand Identity

### 2.1 Name & Tagline

- **Name:** CloudNexus
- **Tagline:** "Your Infinite Cloud. Your Command Center."
- **Short:** CN

### 2.2 Design Philosophy

**Futuristic Command Center** — the app should feel like piloting a personal data spacecraft. Clean information density, purposeful animations, and a sense of control and power. Not cluttered like a sci-fi movie prop — more like a refined aerospace control panel.

### 2.3 Color System — Dual Theme

**Dark Theme (Primary):**

| Token | Value | Usage |
|-------|-------|-------|
| `--cn-bg-primary` | `#0A0E17` | Main background — deep space black |
| `--cn-bg-secondary` | `#111827` | Cards, panels, sidebars |
| `--cn-bg-tertiary` | `#1E293B` | Elevated surfaces, modals |
| `--cn-border` | `#1E3A5F` | Subtle borders — cold blue tint |
| `--cn-text-primary` | `#F1F5F9` | Primary text |
| `--cn-text-secondary` | `#94A3B8` | Secondary/muted text |
| `--cn-accent` | `#3B82F6` | Primary accent — electric blue |
| `--cn-accent-hover` | `#60A5FA` | Accent hover state |
| `--cn-accent-glow` | `rgba(59, 130, 246, 0.15)` | Glow effects on active elements |
| `--cn-success` | `#10B981` | Upload complete, online |
| `--cn-warning` | `#F59E0B` | Paused transfers, low cache |
| `--cn-danger` | `#EF4444` | Errors, delete confirmations |
| `--cn-vault` | `#8B5CF6` | Vault/encryption accent — purple |

**Light Theme:**

| Token | Value | Usage |
|-------|-------|-------|
| `--cn-bg-primary` | `#F8FAFC` | Main background |
| `--cn-bg-secondary` | `#FFFFFF` | Cards, panels |
| `--cn-bg-tertiary` | `#F1F5F9` | Elevated surfaces |
| `--cn-border` | `#CBD5E1` | Borders |
| `--cn-text-primary` | `#0F172A` | Primary text |
| `--cn-text-secondary` | `#64748B` | Secondary text |
| `--cn-accent` | `#2563EB` | Primary accent — slightly deeper blue |
| `--cn-accent-hover` | `#3B82F6` | Accent hover |

**Theme Toggle:** Auto-detect system preference via `prefers-color-scheme`, with manual override persisted in IndexedDB.

### 2.4 Typography

- **Primary Font:** Inter (variable weight)
- **Monospace:** JetBrains Mono (file sizes, paths, hashes, code)
- **Scale:** 12px (caption) / 14px (body) / 16px (subtitle) / 20px (title) / 28px (page header)

### 2.5 Iconography

- **Library:** Lucide React — consistent, minimal stroke icons
- **Custom icons** for module navigation (File Manager, Gallery, Video, Music, Transfers, Vault)
- **Animated micro-icons** for transfer states (uploading spinner, download arrow, pause, error pulse)

### 2.6 Motion & Animation

- **Transitions:** 150ms ease-out for hover states, 250ms for panel transitions
- **Page transitions:** Subtle slide + fade between modules
- **Loading states:** Skeleton screens with shimmer animation (not spinners)
- **Transfer progress:** Smooth animated progress bars with glow effect on the accent color
- **No gratuitous animations** — every animation must serve information clarity

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router, static export) | PWA shell, routing, SSG |
| **Language** | TypeScript | Type safety across the codebase |
| **Telegram API** | GramJS | MTProto client that runs in browser & Web Workers |
| **Local Database** | Dexie.js (IndexedDB wrapper) | Metadata, folder structure, cache index, settings |
| **Encryption** | Web Crypto API | AES-256-GCM client-side encryption |
| **Service Worker** | Workbox | Offline caching, background sync |
| **Styling** | Tailwind CSS v4 + CSS custom properties | Rapid UI dev, theme tokens |
| **State Management** | Zustand | Lightweight, module-scoped stores |
| **Media** | HTML5 Video/Audio + Media Session API | Native playback with OS integration |
| **File Processing** | Web Workers | Chunking, encryption, hashing off main thread |

### 3.2 No Backend Required

CloudNexus runs 100% client-side. There is no server, no database, no API beyond Telegram's MTProto. The Next.js app is statically exported and can be hosted on Vercel, Cloudflare Pages, or even locally.

### 3.3 Telegram Storage Architecture — "Channel as Bucket" Pattern

Instead of dumping all files into Saved Messages, CloudNexus creates and manages **private Telegram channels** as storage buckets:

| Channel | Purpose | Naming Convention |
|---------|---------|-------------------|
| `cn-files` | General file storage | `CloudNexus Files` |
| `cn-photos` | Photo backups | `CloudNexus Photos` |
| `cn-videos` | Video storage | `CloudNexus Videos` |
| `cn-music` | Music library | `CloudNexus Music` |
| `cn-vault` | Encrypted files | `CloudNexus Vault` |
| `cn-meta` | Metadata index backup | `CloudNexus Meta` |

**Why channels?**

- Saved Messages is a single flat chat — no organization
- Channels support up to 2GB per file (same as chat limit)
- Channel messages can be searched, pinned, and paginated
- Each channel acts as an independent "drive partition"
- Channels are private by default — only the user can see them

**Metadata Strategy:**

Each file uploaded to a channel includes structured metadata in the message caption (JSON):

```json
{
  "cn": 1,
  "name": "vacation-2024.mp4",
  "folder": "/Videos/Vacation/Goa",
  "size": 1073741824,
  "mime": "video/mp4",
  "hash": "sha256:abc123...",
  "chunks": 1,
  "chunkIndex": 0,
  "encrypted": false,
  "created": "2026-03-30T10:00:00Z",
  "tags": ["vacation", "goa", "2024"]
}
```

The `cn-meta` channel stores periodic full index snapshots (compressed JSON) for disaster recovery — if local IndexedDB is lost, the app can rebuild the index from this channel.

### 3.4 File Chunking Strategy (2GB Limit)

Since the account has a 2GB per-message limit:

- **Files ≤ 2GB:** Upload as a single message
- **Files > 2GB:** Split into chunks of 1.9GB (with safety margin), each uploaded as a separate message
- **Chunk metadata** links chunks together via a shared `groupId` and `chunkIndex`
- **Reassembly** on download: chunks are fetched in order and concatenated via Blob/ReadableStream

```
file: project-backup.tar.gz (5.2GB)
├── chunk-0 (1.9GB) → message #101 in cn-files
├── chunk-1 (1.9GB) → message #102 in cn-files
└── chunk-2 (1.4GB) → message #103 in cn-files
```

### 3.5 Streaming Architecture

For video and music playback, CloudNexus does NOT download the full file before playing. Instead:

1. **Range-based download** via GramJS `downloadMedia` with `offset` and `limit` parameters
2. **MediaSource API** (for video) or **Blob URL with progressive loading** (for audio)
3. **Buffer-ahead strategy:** Download 10MB ahead of current playback position
4. **Adaptive buffering:** Increase buffer on slow connections, decrease on fast
5. **Cache played segments** in IndexedDB for instant replay/seek within cached range

### 3.6 Encryption Architecture (Vault Module)

```
User enters passphrase
        ↓
PBKDF2 (100,000 iterations, SHA-256) → Master Key
        ↓
AES-256-GCM encrypt(file + metadata)
        ↓
Upload encrypted blob to cn-vault channel
        ↓
Store IV + salt in local IndexedDB (NOT on Telegram)
```

- **Encryption happens in a Web Worker** to avoid blocking the UI
- **Passphrase is never stored** — derived each session
- **Per-file unique IV** — even identical files produce different ciphertext
- **Key caching:** Master key stays in memory for the session (configurable auto-lock timer)
- **Recovery:** Without the passphrase, vault files are irrecoverable. No backdoor by design.

### 3.7 Offline Architecture

| Scenario | Behavior |
|----------|----------|
| Browse files | Full file tree from IndexedDB — works offline |
| View cached media | Photos/videos/music with cached data play offline |
| Upload file | Queued in Transfer Manager, syncs when online |
| Download file | Queued, resumes from last chunk when online |
| Search | Full-text search on local metadata index |
| Theme/settings | All local, always available |

---

## 4. Module Specifications

### 4.1 Module: File Manager

**Purpose:** Full-featured file and folder management interface for all uploaded content.

**Layout:** Two-panel — sidebar folder tree (collapsible) + main content area with file grid/list.

**Features:**

- **Folder operations:** Create, rename, move, delete folders (virtual — stored in IndexedDB, not on Telegram)
- **File operations:** Upload, download, rename, move, copy, delete, share
- **Views:** Grid view (thumbnails), List view (detailed), Column view (Finder-style)
- **Sorting:** Name, size, date modified, date uploaded, type
- **Search:** Real-time search with filters (type, size range, date range, tags, folder)
- **Bulk operations:** Multi-select with Shift/Ctrl, bulk move/delete/download/encrypt
- **Drag & drop:** Upload files by dropping onto the file manager; drag to move between folders
- **File preview panel:** Right sidebar showing file details, thumbnail, metadata, Telegram message link
- **Breadcrumb navigation:** Full path breadcrumbs with click-to-navigate
- **Context menu:** Right-click for all file/folder operations
- **Keyboard shortcuts:**
  - `Ctrl+C/V/X` — Copy/Paste/Cut
  - `Delete` — Move to trash
  - `F2` — Rename
  - `Ctrl+A` — Select all
  - `Ctrl+F` — Focus search
  - `Enter` — Open file/folder
  - `Backspace` — Go up one folder
- **Trash/Recycle Bin:** Soft delete with 30-day auto-purge (deletes from Telegram too)
- **Storage stats:** Dashboard showing total usage per bucket channel, file type distribution, upload trends

**File Type Icons:** Distinct icons for common types — pdf, docx, xlsx, pptx, zip, code files, images, videos, audio, generic.

**Quick Access:**

- Recent files (last 20 accessed)
- Starred/favorited files
- Shared files (files with generated share links)

### 4.2 Module: Gallery

**Purpose:** Dedicated photo and video browsing experience with auto-backup capability.

**Layout:** Full-width masonry/grid with adjustable thumbnail size.

**Features:**

- **Grid view:** Masonry layout with lazy-loaded thumbnails
- **Timeline view:** Grouped by date (Today, Yesterday, This Week, March 2026, etc.)
- **Album view:** User-created albums + auto-generated smart albums (Screenshots, Selfies by EXIF)
- **Lightbox viewer:**
  - Full-screen image view with zoom (pinch on mobile, scroll on desktop)
  - Swipe/arrow navigation between images
  - EXIF data overlay (camera, lens, ISO, shutter speed, GPS)
  - Edit actions: rotate, add to album, set as starred, download, delete
- **Video thumbnails:** Auto-generated from first frame (cached locally)
- **Video playback:** Inline play from gallery → launches Video Player module
- **Auto-backup:**
  - On mobile PWA: detect new photos via periodic check or manual trigger
  - Upload queue with progress indicators
  - Configurable: backup photos only, videos only, or both
  - Duplicate detection via file hash (SHA-256)
- **Selection mode:** Long-press or checkbox to multi-select for bulk operations
- **Info panel:** File details, EXIF data, storage location, Telegram message ID

**Thumbnail Caching:**

- Thumbnails are downloaded once and cached in IndexedDB
- Progressive loading: show blurred placeholder → load thumbnail → full image on tap
- Cache limit configurable (default 500MB for thumbnails)

### 4.3 Module: Video Player

**Purpose:** Stream and play video files stored on Telegram with a full-featured player experience.

**Layout:** Theater-mode player with video list sidebar.

**Features:**

- **Streaming playback:** Video streams from Telegram via progressive download / MediaSource API — no full download required
- **Player controls:**
  - Play/Pause
  - Seek bar with preview thumbnails on hover (generated from cached keyframes)
  - Volume control with mute toggle
  - Playback speed (0.25x to 3x)
  - Fullscreen toggle
  - Picture-in-Picture (PiP) mode
  - Skip forward/back 10s/30s (configurable)
- **Subtitle support:**
  - Load .srt / .vtt files from CloudNexus storage
  - Subtitle styling (font size, color, background opacity)
  - Multi-track subtitle selection
- **Resume playback:** Remember position for each video, resume on reopen
- **Video library view:** Grid of video thumbnails with title, duration, last watched indicator
- **Playlists:** Create video playlists, auto-play next
- **Keyboard shortcuts:**
  - `Space` — Play/Pause
  - `F` — Fullscreen
  - `M` — Mute
  - `←/→` — Seek ±10s
  - `↑/↓` — Volume
  - `P` — PiP mode
- **Buffering indicator:** Visual buffer progress on seek bar
- **Cast support:** (Future) Chromecast via Web Presentation API

**Streaming Implementation:**

```
User presses play
    ↓
Fetch first 10MB chunk from Telegram
    ↓
Feed to MediaSource API SourceBuffer
    ↓
Start playback immediately
    ↓
Background worker: prefetch next chunks
    ↓
On seek: calculate offset, fetch from that point
```

### 4.4 Module: Music Player

**Purpose:** Full-featured music player with library management, playlists, and background playback.

**Layout:** Persistent mini-player bar at bottom of app (across all modules) + full-screen player view.

**Features:**

- **Library view:**
  - All Songs (sortable list)
  - Albums (grid with cover art)
  - Artists (grouped by artist tag from ID3)
  - Playlists (user-created)
  - Recently Played
  - Most Played
- **Now Playing:**
  - Album art (large, centered)
  - Song title, artist, album
  - Progress bar with seek
  - Play/Pause, Next, Previous
  - Shuffle, Repeat (off / one / all)
  - Volume slider
  - Queue view (up next)
- **Mini Player:**
  - Persistent bar at bottom when navigating other modules
  - Shows current song, progress, play/pause, next
  - Tap to expand to full player
- **Background playback:**
  - **Media Session API** integration — lock screen controls, notification controls on mobile
  - Playback continues when switching modules or minimizing browser
  - Album art shown in OS media controls
- **ID3 tag reading:** Extract title, artist, album, genre, year, album art from MP3/FLAC/OGG files using `music-metadata` library in Web Worker
- **Queue management:** Add to queue, reorder, clear queue
- **Crossfade:** Optional crossfade between tracks (1-10s configurable)
- **Equalizer:** (Stretch goal) Web Audio API-based 10-band EQ with presets
- **Lyrics:** (Stretch goal) Fetch lyrics from public APIs or load from .lrc files
- **Scrobbling:** (Stretch goal) Last.fm integration

**Audio Streaming:**

Audio files are typically smaller than video, so the strategy differs:

- **Files < 50MB:** Download full file, cache in IndexedDB, play from cache
- **Files > 50MB:** Stream progressively (same as video)
- **Gapless playback:** Preload next track while current plays

### 4.5 Module: Transfer Manager

**Purpose:** Centralized hub for all uploads and downloads with full control over transfer operations.

**Layout:** Full-page view with tabbed sections (Active, Queued, Completed, Failed).

**Features:**

- **Upload capabilities:**
  - Single file upload (any type, any size)
  - Folder upload (preserves folder structure)
  - Drag & drop zone
  - Clipboard paste (images)
  - Auto-backup uploads (from Gallery module)
  - Bulk upload from file picker
- **Download capabilities:**
  - Single file download
  - Folder download as ZIP (using `fflate` in Web Worker)
  - Bulk download selection
  - Video/music streaming (counted as active download)
- **Transfer controls:**
  - **Pause** — individual transfer or all
  - **Resume** — from last completed chunk (not restart)
  - **Cancel** — with confirmation
  - **Retry** — failed transfers with exponential backoff
  - **Priority** — drag to reorder queue, or set High/Normal/Low
- **Progress tracking:**
  - Per-file progress bar with percentage, speed (MB/s), ETA
  - Overall session progress (X of Y files, total size)
  - Chunk-level progress for large files
- **Transfer states:**
  - `queued` → `preparing` → `transferring` → `completed`
  - `paused` (manual)
  - `failed` (with error details + retry option)
  - `cancelled`
- **Bandwidth management:**
  - Concurrent transfer limit (default: 3 simultaneous)
  - Optional speed throttle (useful on metered connections)
- **Transfer history:**
  - Completed transfers log with timestamp, size, duration, average speed
  - Searchable and filterable
  - Clearable
- **Notifications:**
  - Browser notification on transfer complete (if app is in background)
  - Sound notification (optional, toggle in settings)
- **Resilience:**
  - Auto-resume on reconnection after network drop
  - Transfer queue persisted in IndexedDB — survives page refresh/app restart
  - Flood wait handling — Telegram rate limits are caught and transfers pause/retry automatically

**Transfer Engine Architecture:**

```
Transfer Queue (IndexedDB persisted)
        ↓
Transfer Scheduler (Zustand store)
    ├── checks concurrent limit
    ├── respects priority order
    └── manages pause/resume state
        ↓
Transfer Worker (Web Worker per transfer)
    ├── Chunking (files > 2GB)
    ├── Encryption (if Vault destination)
    ├── SHA-256 hashing (integrity verification)
    └── GramJS upload/download calls
        ↓
Progress Reporter → UI updates via postMessage
```

### 4.6 Module: Vault (Encrypted Storage)

**Purpose:** Store sensitive files with client-side AES-256-GCM encryption. Even if Telegram account is compromised, vault files remain unreadable.

**Layout:** Same as File Manager but with a lock gate — requires passphrase entry to access.

**Features:**

- **Lock screen:** Passphrase entry (or biometric on supported devices via WebAuthn)
- **Auto-lock:** Configurable timer (1min, 5min, 15min, 30min, on tab switch)
- **Passphrase setup:**
  - Minimum 12 characters
  - Strength indicator
  - No recovery option (by design — displayed clearly during setup)
  - Option to change passphrase (re-encrypts key, not all files)
- **File operations:** Same as File Manager — upload, download, organize, preview
  - Files are encrypted before upload and decrypted after download
  - Thumbnails of encrypted images are also encrypted locally
- **Encryption details panel:** Show encryption algorithm, key derivation info, file hash
- **Vault-only search:** Search within vault files only
- **Secure delete:** When deleting from vault, also delete from Telegram (message delete)

**Key Derivation:**

```
Passphrase → PBKDF2(SHA-256, 100K iterations, random salt) → Master Key (256-bit)
Master Key → stored in memory only (never persisted)
Salt → stored in IndexedDB (not sensitive)
Per-file: random IV (96-bit) → AES-256-GCM(Master Key, IV, file data) → ciphertext
IV per file → stored in IndexedDB alongside file metadata
```

---

## 5. Application Shell & Navigation

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  CloudNexus                    [Search] [⚙] [👤]    │  ← Top Bar
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Files   │                                          │
│  Gallery │         Main Content Area                │
│  Videos  │         (Active Module)                  │
│  Music   │                                          │
│  Transfer│                                          │
│  Vault   │                                          │
│          │                                          │
│──────────│                                          │
│  Storage │                                          │
│  ██████  │                                          │
│  12.4 GB │                                          │
├──────────┴──────────────────────────────────────────┤
│  ▶ Song Title — Artist        ━━━━━━━●━━━  ▶ ⏭    │  ← Mini Player (persistent)
└─────────────────────────────────────────────────────┘
```

**Mobile Layout:**

- Bottom navigation bar (5 module icons + More)
- Mini player above bottom nav
- Sidebar becomes full-screen overlay
- Swipe gestures for navigation

### 5.2 Global Search

- **Unified search** across all modules — files, photos, videos, music, vault (if unlocked)
- **Search by:** filename, tags, folder path, EXIF data, ID3 tags, file type
- **Instant results** from local IndexedDB index
- **Keyboard shortcut:** `Ctrl+K` or `/` to focus search

### 5.3 Settings

- **Telegram Account:** Connected account info, session management, logout
- **Theme:** Auto / Dark / Light
- **Transfer Settings:** Concurrent limit, speed throttle, auto-retry count
- **Gallery Settings:** Auto-backup toggle, backup directories, duplicate detection
- **Music Settings:** Crossfade, gapless playback, equalizer presets
- **Video Settings:** Default quality, default subtitle language, PiP behavior
- **Vault Settings:** Auto-lock timer, passphrase change
- **Cache Management:** View cache size per module, clear cache, set cache limit
- **Data Management:** Export metadata index, import index, full re-index from Telegram
- **About:** Version, build info, open-source licenses

---

## 6. Data Models (Dexie.js / IndexedDB)

### 6.1 Schema

```typescript
// Dexie database schema

interface CloudNexusDB extends Dexie {
  files: Table<CNFile>;
  folders: Table<CNFolder>;
  transfers: Table<CNTransfer>;
  musicMeta: Table<CNMusicMeta>;
  videoMeta: Table<CNVideoMeta>;
  thumbnails: Table<CNThumbnail>;
  cache: Table<CNCacheEntry>;
  settings: Table<CNSetting>;
}

interface CNFile {
  id: string;                    // UUID
  name: string;
  folder: string;                // folder path e.g. "/Documents/Work"
  size: number;                  // bytes
  mime: string;
  hash: string;                  // SHA-256
  telegramChannelId: string;     // which bucket channel
  telegramMessageId: number;     // message ID in channel
  chunks: number;                // total chunks (1 if single)
  chunkMessageIds: number[];     // message IDs if multi-chunk
  encrypted: boolean;
  encryptionIV?: string;         // base64 IV if encrypted
  tags: string[];
  starred: boolean;
  deleted: boolean;              // soft delete (trash)
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date;
  uploadedAt: Date;
}

interface CNFolder {
  id: string;
  name: string;
  path: string;                  // full path e.g. "/Documents/Work"
  parentPath: string;            // parent path e.g. "/Documents"
  color?: string;                // optional folder color
  icon?: string;                 // optional custom icon
  createdAt: Date;
  updatedAt: Date;
}

interface CNTransfer {
  id: string;
  type: 'upload' | 'download';
  fileId?: string;               // linked CNFile (null for new uploads)
  fileName: string;
  fileSize: number;
  status: 'queued' | 'preparing' | 'transferring' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'normal' | 'low';
  progress: number;              // 0-100
  bytesTransferred: number;
  speed: number;                 // bytes per second (rolling average)
  currentChunk: number;
  totalChunks: number;
  error?: string;
  retryCount: number;
  destination: string;           // bucket channel or local path
  encrypted: boolean;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface CNMusicMeta {
  fileId: string;                // references CNFile.id
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  trackNumber: number;
  duration: number;              // seconds
  albumArtCacheKey?: string;     // key into thumbnails table
  playCount: number;
  lastPlayedAt?: Date;
  lastPosition: number;          // resume position in seconds
}

interface CNVideoMeta {
  fileId: string;
  title: string;
  duration: number;
  resolution: string;            // e.g. "1920x1080"
  codec?: string;
  thumbnailCacheKey?: string;
  lastPosition: number;          // resume position in seconds
  lastPlayedAt?: Date;
  subtitleFileIds: string[];     // linked subtitle CNFile IDs
}

interface CNThumbnail {
  key: string;                   // fileId or custom key
  blob: Blob;                    // thumbnail image data
  width: number;
  height: number;
  createdAt: Date;
}

interface CNCacheEntry {
  key: string;                   // fileId + range
  blob: Blob;                    // cached file data (or partial)
  rangeStart: number;
  rangeEnd: number;
  createdAt: Date;
  accessedAt: Date;
  size: number;
}

interface CNSetting {
  key: string;
  value: any;
}
```

### 6.2 Indexes

```typescript
db.version(1).stores({
  files: 'id, name, folder, mime, hash, telegramMessageId, starred, deleted, createdAt, updatedAt, accessedAt, *tags',
  folders: 'id, path, parentPath',
  transfers: 'id, type, status, priority, createdAt',
  musicMeta: 'fileId, title, artist, album, genre, year, playCount, lastPlayedAt',
  videoMeta: 'fileId, title, lastPlayedAt',
  thumbnails: 'key, createdAt',
  cache: 'key, createdAt, accessedAt, size',
  settings: 'key'
});
```

---

## 7. Telegram Integration Details

### 7.1 Authentication Flow

```
App Load → Check for saved MTProto session in IndexedDB
    ├── Session exists → Validate session → Load app
    └── No session → Show login screen
            ↓
        Enter phone number
            ↓
        Receive Telegram code (SMS/in-app)
            ↓
        Enter code + optional 2FA password
            ↓
        GramJS creates session → Store in IndexedDB
            ↓
        First-time setup: create bucket channels
```

### 7.2 GramJS Configuration

```typescript
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const client = new TelegramClient(
  new StringSession(savedSession),
  API_ID,      // from my.telegram.org
  API_HASH,    // from my.telegram.org
  {
    connectionRetries: 5,
    useWSS: true,           // WebSocket for browser
    deviceModel: 'CloudNexus PWA',
    appVersion: '1.0.0',
    systemVersion: 'Browser',
  }
);
```

### 7.3 API Rate Limit Handling

Telegram applies flood wait limits. CloudNexus must handle:

- **FLOOD_WAIT_X:** Pause all transfers, wait X seconds, resume
- **FILE_REFERENCE_EXPIRED:** Re-fetch message to get fresh file reference
- **AUTH_KEY_UNREGISTERED:** Session expired — prompt re-login
- **Exponential backoff** for repeated failures: 1s → 2s → 4s → 8s → max 60s

### 7.4 Bucket Channel Initialization

On first login, CloudNexus:

1. Creates 6 private channels (cn-files, cn-photos, cn-videos, cn-music, cn-vault, cn-meta)
2. Pins a "CloudNexus Index" message in each channel (updated periodically)
3. Stores channel IDs in IndexedDB settings
4. If channels already exist (re-install), detect them by name and reconnect

---

## 8. PWA Configuration

### 8.1 Manifest

```json
{
  "name": "CloudNexus",
  "short_name": "CloudNexus",
  "description": "Your Infinite Cloud. Your Command Center.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#0A0E17",
  "background_color": "#0A0E17",
  "categories": ["productivity", "utilities"],
  "icons": [
    { "src": "/icons/cn-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/cn-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/cn-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [{ "name": "media", "accept": ["*/*"] }]
    }
  }
}
```

### 8.2 Service Worker Strategy

| Route/Resource | Strategy | Cache Name |
|---------------|----------|------------|
| App shell (HTML, JS, CSS) | Stale-While-Revalidate | `cn-shell-v1` |
| Fonts | Cache First | `cn-fonts-v1` |
| Thumbnails | Cache First | `cn-thumbnails-v1` |
| Media cache | Cache First (with LRU eviction) | `cn-media-v1` |
| Telegram API calls | Network Only | — |
| Transfer queue | IndexedDB (not SW cache) | — |

### 8.3 Share Target

CloudNexus registers as a PWA share target — users can share files from other apps directly to CloudNexus for upload.

---

## 9. Project Structure

```
cloudnexus/
├── public/
│   ├── icons/                   # PWA icons
│   ├── manifest.json
│   └── sw.js                    # Service worker (Workbox generated)
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout with theme provider
│   │   ├── page.tsx             # Landing / auth gate
│   │   ├── files/               # File Manager module
│   │   ├── gallery/             # Gallery module
│   │   ├── videos/              # Video Player module
│   │   ├── music/               # Music Player module
│   │   ├── transfers/           # Transfer Manager module
│   │   ├── vault/               # Vault module
│   │   └── settings/            # Settings
│   ├── components/
│   │   ├── ui/                  # Shared UI primitives (Button, Input, Modal, etc.)
│   │   ├── layout/              # Shell, Sidebar, TopBar, MiniPlayer
│   │   ├── files/               # File Manager components
│   │   ├── gallery/             # Gallery components
│   │   ├── video/               # Video Player components
│   │   ├── music/               # Music Player components
│   │   ├── transfers/           # Transfer Manager components
│   │   └── vault/               # Vault components
│   ├── lib/
│   │   ├── telegram/
│   │   │   ├── client.ts        # GramJS client singleton
│   │   │   ├── auth.ts          # Authentication flow
│   │   │   ├── channels.ts      # Bucket channel management
│   │   │   ├── upload.ts        # Upload logic with chunking
│   │   │   ├── download.ts      # Download logic with chunking
│   │   │   └── streaming.ts     # Media streaming helpers
│   │   ├── crypto/
│   │   │   ├── encrypt.ts       # AES-256-GCM encryption
│   │   │   ├── decrypt.ts       # Decryption
│   │   │   └── keys.ts          # Key derivation (PBKDF2)
│   │   ├── db/
│   │   │   ├── schema.ts        # Dexie schema definition
│   │   │   ├── files.ts         # File CRUD operations
│   │   │   ├── folders.ts       # Folder CRUD
│   │   │   ├── transfers.ts     # Transfer queue operations
│   │   │   └── cache.ts         # Cache management with LRU
│   │   ├── media/
│   │   │   ├── id3.ts           # ID3 tag extraction
│   │   │   ├── thumbnails.ts    # Thumbnail generation
│   │   │   └── streaming.ts     # MediaSource API helpers
│   │   └── utils/
│   │       ├── chunking.ts      # File chunking/reassembly
│   │       ├── hashing.ts       # SHA-256 hashing in Worker
│   │       ├── formatting.ts    # File size, date formatting
│   │       └── mime.ts          # MIME type detection
│   ├── stores/
│   │   ├── auth.ts              # Telegram auth state
│   │   ├── files.ts             # File browser state
│   │   ├── player.ts            # Music player state (global)
│   │   ├── video.ts             # Video player state
│   │   ├── transfers.ts         # Transfer queue state
│   │   └── vault.ts             # Vault lock/unlock state
│   ├── workers/
│   │   ├── transfer.worker.ts   # Upload/download worker
│   │   ├── crypto.worker.ts     # Encryption worker
│   │   └── hash.worker.ts       # SHA-256 hashing worker
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   └── styles/
│       ├── globals.css          # CSS custom properties (theme tokens)
│       └── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── CLAUDE.md                    # Claude Code instructions
```

---

## 10. Development Phases

### Phase 1: Foundation (Core Infrastructure)

**Goal:** Working Telegram auth + basic file upload/download + app shell

- [ ] Project scaffolding (Next.js + TypeScript + Tailwind)
- [ ] PWA setup (manifest, service worker, icons)
- [ ] Theme system (dual theme with CSS custom properties)
- [ ] App shell (sidebar, topbar, routing)
- [ ] GramJS integration + Telegram auth flow
- [ ] Bucket channel creation/detection
- [ ] Dexie.js database setup with schema
- [ ] Basic file upload to Telegram (single file, no chunking)
- [ ] Basic file download from Telegram
- [ ] Metadata storage in IndexedDB

### Phase 2: File Manager

**Goal:** Full-featured file management

- [ ] Folder tree (create, rename, delete, navigate)
- [ ] File grid and list views
- [ ] File operations (rename, move, copy, delete, trash)
- [ ] Drag & drop upload
- [ ] Bulk operations (multi-select)
- [ ] Context menu
- [ ] Keyboard shortcuts
- [ ] Search with filters
- [ ] File preview panel
- [ ] Storage stats dashboard
- [ ] Breadcrumb navigation
- [ ] Quick access (recent, starred)

### Phase 3: Transfer Manager

**Goal:** Robust transfer engine with full control

- [ ] Transfer queue with persistence (IndexedDB)
- [ ] Upload engine with chunking (files > 2GB)
- [ ] Download engine with chunking
- [ ] Pause/Resume per transfer
- [ ] Cancel with cleanup
- [ ] Priority queue ordering
- [ ] Progress tracking (per-chunk, per-file, overall)
- [ ] Speed calculation (rolling average)
- [ ] ETA calculation
- [ ] Concurrent transfer limit
- [ ] Auto-resume on reconnect
- [ ] Flood wait handling
- [ ] Transfer history log
- [ ] Browser notifications on complete
- [ ] Failed transfer retry with backoff

### Phase 4: Gallery

**Goal:** Photo/video browsing and auto-backup

- [ ] Masonry grid layout with lazy loading
- [ ] Timeline view (date grouping)
- [ ] Album management (create, edit, delete)
- [ ] Lightbox viewer with zoom and swipe
- [ ] EXIF data extraction and display
- [ ] Thumbnail generation and caching
- [ ] Video thumbnail extraction
- [ ] Selection mode for bulk operations
- [ ] Auto-backup system (manual trigger for PWA)
- [ ] Duplicate detection via hash
- [ ] Smart albums (auto-categorized)

### Phase 5: Video Player

**Goal:** Streaming video playback from Telegram

- [ ] Video library view
- [ ] Streaming playback via MediaSource API
- [ ] Player controls (play, pause, seek, volume, speed, fullscreen)
- [ ] Picture-in-Picture
- [ ] Resume playback (remember position)
- [ ] Subtitle loading and rendering (.srt, .vtt)
- [ ] Buffer-ahead strategy
- [ ] Seek within buffered/cached range
- [ ] Video playlists
- [ ] Keyboard shortcuts
- [ ] Adaptive buffering

### Phase 6: Music Player

**Goal:** Full music player with background playback

- [ ] Music library views (songs, albums, artists, playlists)
- [ ] ID3 tag extraction (title, artist, album, art)
- [ ] Now Playing full view
- [ ] Mini player (persistent across modules)
- [ ] Play/Pause/Next/Previous/Shuffle/Repeat
- [ ] Queue management
- [ ] Media Session API (lock screen / notification controls)
- [ ] Background playback (continues across modules)
- [ ] Audio streaming for large files
- [ ] Playlist CRUD
- [ ] Play count tracking
- [ ] Gapless playback
- [ ] Crossfade (configurable)

### Phase 7: Vault

**Goal:** Encrypted storage layer

- [ ] Passphrase setup flow with strength indicator
- [ ] PBKDF2 key derivation
- [ ] AES-256-GCM encryption in Web Worker
- [ ] Encrypted upload/download pipeline
- [ ] Vault lock screen
- [ ] Auto-lock timer
- [ ] Vault file manager (mirrors File Manager UX)
- [ ] Secure delete (Telegram message delete)
- [ ] Encrypted thumbnail handling
- [ ] Passphrase change (re-encrypt master key)

### Phase 8: Polish & Optimization

**Goal:** Production-ready PWA

- [ ] Offline mode testing and edge cases
- [ ] Cache eviction (LRU) for thumbnails and media
- [ ] Performance optimization (virtualized lists, lazy loading)
- [ ] Error boundary and graceful error handling across all modules
- [ ] Metadata index backup to cn-meta channel
- [ ] Index recovery from cn-meta (disaster recovery)
- [ ] Accessibility audit (keyboard nav, screen reader)
- [ ] Mobile responsive polish
- [ ] PWA install prompt
- [ ] Share target integration
- [ ] Settings page (all configurable options)
- [ ] About page with version info

---

## 11. Key Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Telegram API rate limits (flood wait) | Transfers stall | Exponential backoff, queue management, concurrent limit |
| GramJS browser compatibility | App won't work | Extensive testing; fallback to Web Worker for heavy operations |
| MTProto session expiry | User logged out unexpectedly | Graceful re-auth flow, session refresh |
| IndexedDB storage limits | Local cache/metadata lost | LRU eviction, configurable cache limits, metadata backup to cn-meta |
| Telegram ToS changes | Storage backend disappears | Metadata export feature; modular backend (could swap to another service) |
| Large file streaming jank | Poor playback UX | Web Worker for download, adaptive buffer, progressive loading |
| Service Worker update issues | Stale app | Workbox's built-in update flow with user prompt |
| File reference expiry | Downloads fail for old files | Auto-refresh file references on download attempt |

---

## 12. CLAUDE.md (Claude Code Instructions)

```markdown
# CloudNexus — Claude Code Instructions

## Project Overview
CloudNexus is a personal cloud storage PWA using Telegram MTProto (GramJS) as the storage backend.
Tech: Next.js 15 (App Router, static export), TypeScript, Tailwind CSS v4, Dexie.js, GramJS, Zustand, Workbox.

## Architecture Rules
- NO backend server. Everything runs client-side.
- Telegram is the ONLY remote storage. No Supabase, no Firebase, no external APIs.
- All heavy computation (encryption, hashing, chunking) MUST run in Web Workers.
- State management via Zustand — one store per module domain.
- Local data via Dexie.js (IndexedDB) — NOT localStorage.
- All components must support both light and dark themes via CSS custom properties.

## Code Standards
- TypeScript strict mode. No `any` types except for GramJS interop where unavoidable.
- Functional components only. No class components.
- Custom hooks for reusable logic (useTransfer, usePlayer, useVault, etc.).
- Error boundaries around each module.
- All async operations must have loading, error, and empty states.

## File Naming
- Components: PascalCase (FileManager.tsx, MiniPlayer.tsx)
- Utilities/hooks: camelCase (useTransfer.ts, formatFileSize.ts)
- Workers: kebab-case with .worker suffix (transfer.worker.ts)
- Types: PascalCase with interface prefix convention (CNFile, CNTransfer)

## Testing
- Unit tests for utility functions (chunking, formatting, crypto)
- Integration tests for Dexie operations
- E2E tests deferred to Phase 8

## Do NOT
- Do not add any backend/server code
- Do not use localStorage (only IndexedDB via Dexie)
- Do not block the main thread with crypto or file operations
- Do not store encryption keys or passphrases in any persistent storage
- Do not make the app multi-user — it's personal use only
```

---

## 13. Success Metrics (Personal)

- All 6 modules functional and stable
- Video streaming starts playback within 3 seconds
- Music background playback works reliably on Android Chrome PWA
- Transfers resume correctly after network interruption
- Vault encryption/decryption round-trip works for all file types
- App works offline for browsing and queue management
- Full metadata recovery possible from cn-meta channel backup

---

*Document generated: March 30, 2026*
*Status: Ready for Claude Code development — Phase 1 first*
