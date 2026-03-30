# CloudNexus — Claude Code Instructions

## Project Overview
CloudNexus is a personal cloud storage PWA using Telegram MTProto (GramJS) as the storage backend.
Tech: Next.js 16 (App Router, static export), TypeScript, Tailwind CSS v4, Dexie.js, GramJS, Zustand, Workbox.

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
- Use the logger utility (src/lib/utils/logger.ts) instead of console.log.

## File Naming
- Components: PascalCase (FileManager.tsx, MiniPlayer.tsx)
- Utilities/hooks: camelCase (useTransfer.ts, formatFileSize.ts)
- Workers: kebab-case with .worker suffix (transfer.worker.ts)
- Types: PascalCase with CN prefix (CNFile, CNTransfer)

## Path Aliases
- `@/*` maps to `./src/*`

## Testing
- Vitest + React Testing Library
- Unit tests for utility functions (chunking, formatting, crypto)
- Integration tests for Dexie operations
- Run: `npm test` or `npm run test:watch`

## Commands
- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build (static export)
- `npm run lint` — ESLint with zero warnings
- `npm run typecheck` — TypeScript type check
- `npm test` — Run all tests

## Do NOT
- Do not add any backend/server code
- Do not use localStorage (only IndexedDB via Dexie)
- Do not block the main thread with crypto or file operations
- Do not store encryption keys or passphrases in any persistent storage
- Do not make the app multi-user — it's personal use only
- Do not use console.log — use the logger utility
