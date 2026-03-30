const MIME_MAP: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  wma: 'audio/x-ms-wma',
  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  // Archives
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  // Code
  js: 'text/javascript',
  ts: 'text/typescript',
  html: 'text/html',
  css: 'text/css',
  py: 'text/x-python',
  java: 'text/x-java',
  // Other
  apk: 'application/vnd.android.package-archive',
  iso: 'application/x-iso9660-image',
};

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MIME_MAP[ext] ?? 'application/octet-stream';
}

export function getFileExtension(mime: string): string {
  for (const [ext, mimeType] of Object.entries(MIME_MAP)) {
    if (mimeType === mime) return ext;
  }
  return '';
}

export function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}

export function isVideo(mime: string): boolean {
  return mime.startsWith('video/');
}

export function isAudio(mime: string): boolean {
  return mime.startsWith('audio/');
}

export function isDocument(mime: string): boolean {
  return (
    mime.startsWith('application/pdf') ||
    mime.startsWith('application/msword') ||
    mime.includes('officedocument') ||
    mime.startsWith('text/')
  );
}

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export function getFileCategory(mime: string): FileCategory {
  if (isImage(mime)) return 'image';
  if (isVideo(mime)) return 'video';
  if (isAudio(mime)) return 'audio';
  if (isDocument(mime)) return 'document';
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('7z') ||
    mime.includes('tar') ||
    mime.includes('gzip')
  )
    return 'archive';
  return 'other';
}
