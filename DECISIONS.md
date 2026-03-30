# CloudNexus Decisions Log

### DEC-001: Next.js 16 instead of 15
**Date:** 2026-03-30
**Agent:** DEV-Architect
**Context:** PRD specifies Next.js 15 but create-next-app installed v16.2.1
**Decision:** Use Next.js 16 (latest stable)
**Rationale:** v16 is the current latest; App Router and static export work the same way. Better security and performance.
**Impact:** No functional difference for this project.

### DEC-002: Vitest over Jest
**Date:** 2026-03-30
**Agent:** DEV-Architect
**Context:** PRD mentions vitest, confirming choice
**Decision:** Use Vitest with jsdom and React Testing Library
**Rationale:** Faster than Jest, native ESM support, works great with Vite/Next.js
**Impact:** Test setup uses vitest.config.ts

### DEC-003: Static Export Mode
**Date:** 2026-03-30
**Agent:** DEV-Architect
**Context:** PRD says "100% client-side, no backend"
**Decision:** Use `output: "export"` in next.config.ts for fully static build
**Rationale:** No server needed. Can deploy to any static host (Vercel, Cloudflare Pages, etc.)
**Impact:** No API routes, no server components that fetch data, no ISR/SSR

### DEC-004: music-metadata-browser deprecation
**Date:** 2026-03-30
**Agent:** DEV-Architect
**Context:** music-metadata-browser is deprecated in favor of music-metadata
**Decision:** Keep music-metadata-browser for now, migrate to music-metadata in Phase 6
**Rationale:** It still works and is the browser-compatible version. Will evaluate music-metadata's browser support later.
**Impact:** Minor — may need to swap library in Phase 6
