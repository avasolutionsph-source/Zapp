import clsx from 'clsx';

type SkeletonVariant = 'text' | 'card' | 'table' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  lines?: number;
  className?: string;
}

function Pulse({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-gray-200', className)} />;
}

function TextSkeleton({ lines = 3 }: { lines: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Pulse
          key={i}
          className={clsx(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Pulse className="w-10 h-10 rounded-full" />
        <div className="flex-1 flex flex-col gap-2">
          <Pulse className="h-4 w-1/3" />
          <Pulse className="h-3 w-1/2" />
        </div>
      </div>
      <TextSkeleton lines={3} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, r) => (
        <div key={r} className="px-4 py-3 flex gap-4 border-t border-gray-100">
          {Array.from({ length: 4 }).map((_, c) => (
            <Pulse key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CircleSkeleton() {
  return <Pulse className="w-12 h-12 !rounded-full" />;
}

export function Skeleton({ variant = 'text', lines = 3, className }: SkeletonProps) {
  return (
    <div className={className} aria-hidden="true">
      {variant === 'text' && <TextSkeleton lines={lines} />}
      {variant === 'card' && <CardSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'circle' && <CircleSkeleton />}
    </div>
  );
}
