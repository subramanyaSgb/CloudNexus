// Telegram constraints
export const TELEGRAM_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const TELEGRAM_CHUNK_SIZE = 1.9 * 1024 * 1024 * 1024; // 1.9GB safety margin
export const TELEGRAM_DOWNLOAD_CHUNK_SIZE = 1024 * 1024; // 1MB download chunks

// Media streaming
export const STREAM_PREFETCH_SIZE = 10 * 1024 * 1024; // 10MB
export const AUDIO_CACHE_THRESHOLD = 50 * 1024 * 1024; // 50MB — below this, cache full file

// Transfer
export const MAX_RETRY_COUNT = 5;
export const BACKOFF_BASE_MS = 1000;
export const BACKOFF_MAX_MS = 60000;

// Vault
export const PBKDF2_ITERATIONS = 100_000;
export const AES_KEY_LENGTH = 256;
export const IV_LENGTH = 12; // 96 bits for AES-GCM

// Trash
export const TRASH_PURGE_DAYS = 30;

// UI
export const RECENT_FILES_LIMIT = 20;
export const SEARCH_DEBOUNCE_MS = 300;

// Thumbnail
export const THUMBNAIL_MAX_WIDTH = 320;
export const THUMBNAIL_MAX_HEIGHT = 320;
export const THUMBNAIL_QUALITY = 0.8;
