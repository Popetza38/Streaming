export default function Loading() {
    return (
        <div className="min-h-screen">
            {/* Hero Skeleton */}
            <div className="relative h-[70vh] bg-dark-surface animate-pulse">
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:px-12">
                    <div className="container mx-auto">
                        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
                        <div className="h-10 w-96 max-w-full bg-white/10 rounded mb-3" />
                        <div className="h-4 w-64 bg-white/10 rounded mb-6" />
                        <div className="flex gap-3">
                            <div className="h-12 w-32 bg-white/10 rounded-md" />
                            <div className="h-12 w-32 bg-white/10 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Skeleton */}
            <div className="container mx-auto px-4 lg:px-8 py-8 space-y-10">
                {[1, 2, 3].map((section) => (
                    <div key={section}>
                        <div className="h-6 w-40 bg-white/10 rounded mb-4 animate-pulse" />
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6].map((card) => (
                                <div
                                    key={card}
                                    className="flex-shrink-0 w-[160px] animate-pulse"
                                >
                                    <div className="aspect-drama bg-white/5 rounded-xl mb-2" />
                                    <div className="h-3 w-3/4 bg-white/10 rounded mb-1" />
                                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
