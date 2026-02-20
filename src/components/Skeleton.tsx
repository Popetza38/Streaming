export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 md:w-48">
      <div className="aspect-drama bg-dark-elevated shimmer rounded-lg mb-2" />
      <div className="h-4 bg-dark-elevated shimmer rounded w-3/4 mb-1" />
      <div className="h-3 bg-dark-elevated shimmer rounded w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] bg-dark-elevated shimmer" />
  );
}

export function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-drama bg-dark-elevated shimmer rounded-lg mb-2" />
          <div className="h-4 bg-dark-elevated shimmer rounded w-3/4 mb-1" />
          <div className="h-3 bg-dark-elevated shimmer rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 aspect-drama bg-dark-elevated shimmer rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-dark-elevated shimmer rounded w-3/4" />
          <div className="h-4 bg-dark-elevated shimmer rounded w-1/2" />
          <div className="h-20 bg-dark-elevated shimmer rounded" />
          <div className="flex gap-2">
            <div className="h-10 bg-dark-elevated shimmer rounded w-32" />
            <div className="h-10 bg-dark-elevated shimmer rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
