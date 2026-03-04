import { Skeleton } from '@/components/ui/skeleton';

interface ContentCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ContentCardSkeleton({ viewMode = 'grid' }: ContentCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-start gap-3 p-3 bg-card rounded-2xl border border-border/60">
        <Skeleton className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-14 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-2.5 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ContentCardSkeletonGrid({ count = 6, viewMode = 'grid' }: { count?: number; viewMode?: 'grid' | 'list' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ContentCardSkeleton key={`skeleton-${index}`} viewMode={viewMode} />
      ))}
    </>
  );
}
