import type { FileCategory } from './mime';

// Returns lucide-react icon name for each file category
export function getFileIconName(category: FileCategory): string {
  switch (category) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Music';
    case 'document':
      return 'FileText';
    case 'archive':
      return 'Archive';
    default:
      return 'File';
  }
}

// Returns color for each file category (CSS variable references)
export function getFileCategoryColor(category: FileCategory): string {
  switch (category) {
    case 'image':
      return '#10B981'; // green
    case 'video':
      return '#8B5CF6'; // purple
    case 'audio':
      return '#F59E0B'; // amber
    case 'document':
      return '#3B82F6'; // blue
    case 'archive':
      return '#EF4444'; // red
    default:
      return '#94A3B8'; // gray
  }
}
