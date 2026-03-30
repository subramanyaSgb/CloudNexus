'use client';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width, height = '16px', className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`cn-skeleton ${className}`}
      style={{
        width: width ?? '100%',
        height,
        borderRadius: rounded ? 'var(--cn-radius-full)' : 'var(--cn-radius-md)',
      }}
    />
  );
}
